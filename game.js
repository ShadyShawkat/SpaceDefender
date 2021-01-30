const canvas = document.querySelector("canvas");
canvas.width = 500;
canvas.height = 600;
const ctx = canvas.getContext("2d");
var spikedEnemyImg = new Image();
spikedEnemyImg.src = "spikedEnemy.png";
var playerIsAbleToShoot = true;
var playerProjectilesCooldown = 250;
var shootingHandler;
var playerProjectileDamage = 30;
var playerSpeed = 2;
var isMovingLeft = false;
var isMovingRight = false;
var isMovingUp = false;
var isMovingDown = false;
var backgroundImage = new Image();
backgroundImage.src = "background.png";
var backgroundScrollingSpeed = 1;
var backgroundY = 0;
var powerUpSpawnHandler;
var spawningEnemiesHandler;
var creatingBulletsForSquareEnemiesHandler;
var creatingBulletsForSpikedEnemiesHandler;
var firingCooldownForSquareEnemies = 1500;
var firingCooldownForSpikedEnemies = 2000;
var enemySpawningTimeDifficulty = 3000;
var difficultyHandler;
var animationHandler;
var healthPoints = 100;
var colorsArray = ["#c200bb", "#b681eb", "#60a390", "#d97930"];
var healthPowerUpImg = new Image();
healthPowerUpImg.src = "healthIcon.png";
var bulletPowerUpImg = new Image();
bulletPowerUpImg.src = "bulletIcon.png";
var bulletsOfPlayer = 1;
var bulletIncreasePowerUpDuration = 5000;
var score = 0
var calculateScoreHandler;
var backgroundAnimationHandler;
var gameplayMusic = new Audio('Sound Effects/GamePlayMusic/A Theme For Space (8bit music).mp3');
var scoresArray = new Array();
var nameOfScoresArray = new Array();
var highScore;

playerMovementSpeedBase = {
    x: 0,
    y: 0
};
playerMovementSpeed = {
    x: 0,
    y: 0
};
projectileMovementSpeed = {
    x: 0,
    y: -2
}

class Player {
    constructor(width, height, x, y, color, speed) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.bullets;
        this.angleRight;
        this.angleLeft;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI)
        ctx.closePath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#0';
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.speed.x;
        this.y = this.y + this.speed.y;
        this.angleRight = { x: this.x + 100, y: this.y - 100 };
        this.angleLeft = { x: this.x - 100, y: this.y - 100 };
        this.bullets = bulletsOfPlayer;
    }
}

class enemy {
    constructor(width, height, x, y, color, rotate, speed, health, enemyType) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.enemyType = enemyType;
        this.health = health;
        this.rotate = rotate;
        this.randomRotationDirection = (Math.random() > 0.5) ? true : false;
        this.rotateAngle = Math.random() * 4 + 1;
        this.translateX = (this.x + this.width / 2);
        this.translateY = (this.y + this.width / 2);
        this.isHitting = false;
        this.baseSize = this.width;
        this.isMaxSize = false;
    }

    draw() {
        if (this.enemyType == "square") {
            ctx.save();
            ctx.translate(this.translateX, this.translateY);
            ctx.rotate(this.rotate * Math.PI / 180);
            ctx.beginPath();
            ctx.rect(-(this.width / 2), -(this.width / 2), this.width, this.width);
            ctx.closePath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#0';
            ctx.stroke();
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        } else if (this.enemyType == "spiked") {
            ctx.drawImage(spikedEnemyImg, this.x, this.y, this.width, this.width);
        }
    }

    update() {
        this.draw();
        if (this.enemyType == "square") {
            if (this.randomRotationDirection)
                this.rotate -= this.rotateAngle;
            else
                this.rotate += this.rotateAngle;
            this.x = this.x + this.speed.x;
            this.y = this.y + this.speed.y;
            this.translateX = (this.x + this.width / 2);
            this.translateY = (this.y + this.width / 2);
        } else if (this.enemyType == "spiked") {
            this.x = this.x + this.speed.x;
            this.y = this.y + this.speed.y;
            if (!this.isMaxSize) {
                this.width += 1;
                if (this.width > this.baseSize + 15)
                    this.isMaxSize = true;
            } else {
                this.width -= 1;
                if (this.width < this.baseSize - 15)
                    this.isMaxSize = false;
            }
        }
    }
}

class playerProjectiles {
    constructor(width, height, x, y, color, speed, damage) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.damage = damage;
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.height, this.y + this.width);
        ctx.lineTo(this.x + this.height, this.y + this.width);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0';
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.draw();
        this.x = this.x + this.speed.x;
        this.y = this.y + this.speed.y;
    }
}

class enemyProjectiles {
    constructor(width, height, x, y, color, speed) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = speed;
        this.isHitting = false;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0';
        ctx.stroke();
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.speed.x;
        this.y = this.y + this.speed.y;
    }
}

class healthPointsBar {
    constructor(width, height, healthLeft) {
        this.borderWidth = 5;
        this.width = width - this.borderWidth * 2;
        this.height = height - this.borderWidth * 2;
        this.healthLeft = healthLeft;
    }
    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.borderWidth, canvas.height - this.height, this.width, this.height - this.borderWidth);
        ctx.closePath();
        ctx.lineWidth = this.borderWidth;
        ctx.strokeStyle = 'lightblue';
        ctx.stroke();
        ctx.restore();
        if (healthPoints > 0) {
            ctx.save();
            ctx.beginPath();
            if (healthPoints >= 100)
                healthPoints = 100;
            ctx.rect(this.borderWidth, canvas.height - this.height, this.width * (healthPoints / 100), this.height - this.borderWidth);
            ctx.closePath();
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.restore();
        }
    }
    update() {
        this.draw();
    }
}

class powerUp {
    constructor(size, powerUpType, speed) {
        this.size = size;
        this.x = Math.random() * (canvas.width - this.size * 2);
        this.y = -size;
        this.powerUpType = powerUpType;
        this.speed = speed;
    }

    draw() {
        if (this.powerUpType == "health")
            ctx.drawImage(healthPowerUpImg, this.x, this.y, this.size, this.size);
        if (this.powerUpType == "bullet")
            ctx.drawImage(bulletPowerUpImg, this.x, this.y, this.size, this.size);
    }

    update() {
        this.draw();
        this.y += this.speed;
    }
}

class explosion {
    constructor(x, y, radius, color, speed, enemyType) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.alpha = 1;
        this.exploWidth = 20;
        this.enemyType = enemyType;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
        ctx.closePath();
        ctx.lineWidth = this.exploWidth;
        if (this.enemyType == "square")
            ctx.strokeStyle = this.color;
        else
            ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.restore();
    }
    update() {
        this.draw();
        this.radius += this.speed;
        this.exploWidth -= 0.25;
        this.alpha -= 0.01;
    }

}

const player = new Player(25, 25, 235, 500, "#ffff00", playerMovementSpeed);
const healthBar = new healthPointsBar(canvas.width, 35, healthPoints);
const playerProjsArray = [];
const enemiesArray = [];
const enemyProjsArray = [];
const powerUpArray = [];
const explosionsArray = [];

if (localStorage.length != 0) {
    if (localStorage.getItem("scoresArray") != null) {
        scoresArray = JSON.parse(localStorage.getItem("scoresArray"));
        nameOfScoresArray = JSON.parse(localStorage.getItem("nameOfScoresArray"));
    }
    highScore = JSON.parse(localStorage.getItem("highScore"));
    document.getElementById("highScore").innerHTML = highScore;
} else {
    highScore = 0;
}


//increasing player's bullets on bullet power up acquisition
function increaseBullets() {
    if (bulletsOfPlayer == 4)
        return;
    else {
        bulletsOfPlayer++;
    }
}

// drawing moving background
function drawBackground() {
    backgroundY += backgroundScrollingSpeed;
    backgroundY %= canvas.height;
    ctx.drawImage(backgroundImage, 0, backgroundY, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, backgroundY - canvas.height, canvas.width, canvas.height);
}

//spawning power ups
function spawnPowerUps() {
    // let powerUpFlag = false;
    powerUpSpawnHandler = setInterval(function() {
        if (document.visibilityState == 'visible') {
            const randomInterval = Math.floor(Math.random() * 5000 + 10000);
            if (Math.random() > 0.6)
                setTimeout(function() {
                    powerUpArray.push(new powerUp(30, "health", 1));
                    // powerUpFlag = true;
                }, randomInterval)
            else if (Math.random() > 0.6)
                setTimeout(function() {
                    powerUpArray.push(new powerUp(30, "bullet", 1));
                    // powerUpFlag = false;
                }, randomInterval)
        }
    }, 5000);
}

//spawning enemies and bullets
function spawnEnemies() {
    spawningEnemiesHandler = setInterval(function() {
            if (document.visibilityState == 'visible') {
                let width = Math.floor(Math.random() * 30 + 30);
                let x = Math.random() * (canvas.width - width);
                let y = 0 - width;
                let enemyMovementSpeed = {
                    x: 0,
                    y: 0.4
                };
                let rotate = Math.floor(Math.random() * 90);
                const enemyRandomizer = Math.random();
                if (enemyRandomizer < 0.7) {
                    const color = Math.floor(Math.random() * colorsArray.length);
                    enemiesArray.push(new enemy(width, width, x, y, colorsArray[color], rotate, enemyMovementSpeed, 90, "square"));
                } else {
                    width += 20;
                    enemiesArray.push(new enemy(width, width, x, y, 0, 0, enemyMovementSpeed, 150, "spiked"));
                }
            }
        },
        enemySpawningTimeDifficulty);

    creatingBulletsForSquareEnemiesHandler = setInterval(function() {
        enemiesArray.forEach((enemy, index) => {
            if (enemy.enemyType == "square") {
                const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                const speed = {
                    x: Math.cos(angle),
                    y: Math.sin(angle)
                }
                enemyProjsArray.push(new enemyProjectiles(5, 5, enemy.x, enemy.y, "red", speed));
            }
        })
    }, firingCooldownForSquareEnemies);

    creatingBulletsForSpikedEnemiesHandler = setInterval(function() {
        const rapidFire = setInterval(function() {
            enemiesArray.forEach((enemy, index) => {
                if (enemy.enemyType == "spiked") {
                    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                    const speed = {
                        x: Math.cos(angle),
                        y: Math.sin(angle)
                    }
                    enemyProjsArray.push(new enemyProjectiles(5, 5, enemy.x, enemy.y, "red", speed));
                }
            })
            setTimeout(function() {
                clearInterval(rapidFire);
            }, firingCooldownForSpikedEnemies / 4);
        }, firingCooldownForSpikedEnemies / 14);
    }, firingCooldownForSpikedEnemies);
}

//reducing health if a bullet or an enemy hit the player
function reduceHealth(obj) {
    if (obj instanceof enemyProjectiles) {
        const audio = new Audio('Sound Effects/PlayerTakingDamage/sfx_sound_neutral11.wav');
        audio.play();
        healthPoints -= 20;
    }

    if (obj instanceof enemy) {
        const audio = new Audio('Sound Effects/PlayerTakingDamage/sfx_sound_neutral11.wav');
        audio.play();
        healthPoints -= 35;
    }

    if (bulletsOfPlayer > 1) {
        bulletsOfPlayer--;
    }
}

//increases player's health points on health pick up
function increaseHealth() {
    healthPoints += 20;
}

function calculateScore() {
    calculateScoreHandler = setInterval(function() {
        document.getElementById("score").innerHTML = ++score;
    }, 250)
}

//GameOver
function gameOver() {
    const audio = new Audio('Sound Effects/GameOver/sfx_sound_shutdown2.wav');
    audio.play();
    gameplayMusic.pause();
    cancelAnimationFrame(animationHandler);
    clearInterval(creatingBulletsForSquareEnemiesHandler);
    clearInterval(creatingBulletsForSpikedEnemiesHandler);
    clearInterval(spawningEnemiesHandler);
    clearInterval(difficultyHandler);
    clearInterval(calculateScoreHandler);
    animatebackgroundMovement();
    document.getElementById("scoreDiv").style.display = "none";
    document.getElementById("gameOverDiv").style.display = "flex";
    document.getElementById("pointsScoredOnGameOver").innerHTML = score;
    if (highScore < score)
        localStorage.setItem("highScore", JSON.stringify(score));
}

//animating background movement on start
function animatebackgroundMovement() {
    backgroundAnimationHandler = requestAnimationFrame(animatebackgroundMovement);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
}

//animation loop
function animate() {
    animationHandler = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    powerUpArray.forEach((powerup, index) => {
        powerup.update();

        //deleting powerup that scroll off screen
        if (powerup.y > canvas.height) {
            powerUpArray.splice(index, 1)
        }

        //detecting powerup acquisition 
        const distance = Math.hypot(player.x - powerup.x, player.y - powerup.y);
        if (distance - powerup.size - player.width < 1) {
            const audio = new Audio('Sound Effects/PlayerTakingPowerUp/sfx_sounds_fanfare1.wav');
            audio.play();
            score += 50;
            if (powerup.powerUpType == "health")
                increaseHealth();
            if (powerup.powerUpType == "bullet")
                increaseBullets();
            powerUpArray.splice(index, 1)
        }
    });

    //restricting player in the canvas
    if (player.x < player.width)
        player.x = player.width;
    if (player.x > canvas.width - player.width)
        player.x = canvas.width - player.width;
    if (player.y < player.width)
        player.y = player.width;
    if (player.y > canvas.height - player.width)
        player.y = canvas.height - player.width;

    player.update();
    playerProjsArray.forEach((proj, index) => {
        proj.update();
        if (proj.y < 0 || proj.x < 0 || proj.x > canvas.width)
            playerProjsArray.splice(index, 1)
    })

    //detecting if enemy projectiles hit the player and removing them off screen
    enemyProjsArray.forEach((proj, index) => {
        if (proj.y > canvas.height || proj.y < 0 || proj.x > canvas.width || proj.x < 0) {
            enemyProjsArray.splice(index, 1);
        }
        const distance = Math.hypot(player.x - proj.x, player.y - proj.y);
        if (distance - proj.width - player.width < 1 && !proj.isHitting) {
            reduceHealth(proj);
            proj.isHitting = true;
            enemyProjsArray.splice(index, 1);
        }
        proj.update();
    });

    //removing explosions after the fade out
    explosionsArray.forEach((explosion, index) => {
        if (explosion.alpha <= 0.1)
            explosionsArray.splice(index, 1);
        explosion.update();
    });

    enemiesArray.forEach((enemy, index) => {
        enemy.update();
        if (enemy.y > canvas.height)
            enemiesArray.splice(enemy, index)

        // detect if enemy hit the player
        const distance = Math.hypot(player.x - (enemy.x + enemy.width / 2), player.y - (enemy.y + enemy.width / 2));
        if (distance - enemy.width / 2 - player.width < 1 && !enemy.isHitting) {
            reduceHealth(enemy);
            enemy.isHitting = true;
        }

        playerProjsArray.forEach((proj, projIndex) => {
            const distance = Math.hypot(proj.x - (enemy.x + enemy.width / 2), proj.y - (enemy.y + enemy.width / 2));
            if (distance - enemy.width / 2 - proj.width < 1) {
                setTimeout(function() {
                    playerProjsArray.splice(projIndex, 1);
                    enemy.health -= proj.damage;
                    if (enemy.health <= 0) {
                        score += 100;
                        let randomAudio = Math.floor(Math.random() * 5) + 1;
                        if (randomAudio == 1) {
                            const audio = new Audio('Sound Effects/Explosions/sfx_exp_short_hard2.wav');
                            audio.play()
                        } else if (randomAudio == 2) {
                            const audio = new Audio('Sound Effects/Explosions/sfx_exp_short_hard8.wav');
                            audio.play()
                        } else if (randomAudio == 3) {
                            const audio = new Audio('Sound Effects/Explosions/sfx_exp_short_hard10.wav');
                            audio.play()
                        } else if (randomAudio == 4) {
                            const audio = new Audio('Sound Effects/Explosions/sfx_exp_short_hard14.wav');
                            audio.play()
                        } else {
                            const audio = new Audio('Sound Effects/Explosions/sfx_exp_short_soft1.wav');
                            audio.play()
                        }
                        explosionsArray.push(new explosion(enemy.x, enemy.y, enemy.width, enemy.color, 0.5, enemy.enemyType));
                        enemiesArray.splice(index, 1);
                    }
                }, 0)
            }
        });
    })

    healthBar.update();
    if (healthPoints <= 0)
        gameOver();
}

//difficulty increases with time 
function difficultyIncrease() {
    difficultyHandler = setInterval(function() {
        if (enemySpawningTimeDifficulty > 750) {
            enemySpawningTimeDifficulty -= 50;
            clearInterval(creatingBulletsForSquareEnemiesHandler);
            clearInterval(creatingBulletsForSpikedEnemiesHandler);
            clearInterval(spawningEnemiesHandler);
            spawnEnemies();
        }
    }, 3000)

}

// shooting and moving
addEventListener("keydown", function(e) {
    if (e.key == ' ') {
        if (playerIsAbleToShoot == true) {
            setTimeout(function() {
                const audio = new Audio('Sound Effects/PlayerShooting/sfx_weapon_singleshot8.wav');
                audio.play();
                playerIsAbleToShoot = false;
                const bulletPointsArray = [];
                for (let i = 0; i < player.bullets; i++)
                    bulletPointsArray[i] = (player.angleRight.x + player.angleLeft.x) * ((i + 1) / (player.bullets + 1));

                for (let i = 0; i < bulletPointsArray.length; i++) {
                    const angle = Math.atan2(player.y, player.x - bulletPointsArray[i]);
                    const speed = {
                        x: Math.cos(angle),
                        y: -1
                    }
                    playerProjsArray.push(new playerProjectiles(10, 5, player.x, player.y - player.width, "#c7c708", speed, playerProjectileDamage));
                }

            }, 0);
            shootingHandler = setInterval(function() {
                const audio = new Audio('Sound Effects/PlayerShooting/sfx_weapon_singleshot8.wav');
                audio.play();
                playerIsAbleToShoot = false;
                const bulletPointsArray = [];
                for (let i = 0; i < player.bullets; i++)
                    bulletPointsArray[i] = (player.angleRight.x + player.angleLeft.x) * ((i + 1) / (player.bullets + 1));

                for (let i = 0; i < bulletPointsArray.length; i++) {
                    const angle = Math.atan2(player.y, player.x - bulletPointsArray[i]);
                    const speed = {
                        x: Math.cos(angle),
                        y: -1
                    }
                    playerProjsArray.push(new playerProjectiles(10, 5, player.x, player.y - player.width, "#c7c708", speed, playerProjectileDamage));
                }
            }, playerProjectilesCooldown);
        }
    } else if (e.key == 'ArrowLeft' && !isMovingLeft) {
        playerMovementSpeed.x += (playerMovementSpeedBase.x - playerSpeed);
        isMovingLeft = true;
    } else if (e.key == 'ArrowRight' && !isMovingRight) {
        playerMovementSpeed.x += (playerMovementSpeedBase.x + playerSpeed);
        isMovingRight = true;
    } else if (e.key == 'ArrowUp' && !isMovingUp) {
        playerMovementSpeed.y += (playerMovementSpeedBase.y - playerSpeed);
        isMovingUp = true;
    } else if (e.key == 'ArrowDown' && !isMovingDown) {
        playerMovementSpeed.y += (playerMovementSpeedBase.y + playerSpeed);
        isMovingDown = true;
    }
})

// stop shooting or moving
addEventListener("keyup", function(e) {
    if (e.key == 'ArrowLeft') {
        playerMovementSpeed.x -= (playerMovementSpeedBase.x - playerSpeed);
        isMovingLeft = false;
    } else if (e.key == 'ArrowRight') {
        playerMovementSpeed.x -= (playerMovementSpeedBase.x + playerSpeed);
        isMovingRight = false;
    } else if (e.key == 'ArrowUp') {
        playerMovementSpeed.y -= (playerMovementSpeedBase.y - playerSpeed);
        isMovingUp = false;
    } else if (e.key == 'ArrowDown') {
        playerMovementSpeed.y -= (playerMovementSpeedBase.y + playerSpeed);
        isMovingDown = false;
    } else if (e.key == ' ') {
        clearInterval(shootingHandler);
        playerIsAbleToShoot = true;
    }
})

//starts the game
function startGame() {
    gameplayMusic.play();
    gameplayMusic.loop = true;
    cancelAnimationFrame(backgroundAnimationHandler);
    backgroundY = 0;
    animate();
    spawnEnemies();
    spawnPowerUps();
    difficultyIncrease();
    calculateScore();
}

//starts the game when the user presses "start"
document.getElementById("startGameBtn").addEventListener('click', function() {
    const audio = new Audio('Sound Effects/GameStart/sfx_menu_select4.wav');
    audio.play();
    startGame();
    document.getElementById("startGameDiv").style.display = "none";
    document.getElementById("scoreDiv").style.display = "block";
})

//starts the game over when the user presses "restart"
document.getElementById("restartGameBtn").addEventListener('click', function() {
    window.location.reload(false);
})

//clears local storage  when the user presses "clear scoreboard"
document.getElementById("clearScoreboard").addEventListener('click', function() {
    localStorage.clear();
    document.getElementById("highScore").innerHTML = 0;
})

//shows scoreboard when user the user presses "show scoreboard"
document.getElementById("showScoreboardBtn").addEventListener('click', function() {
    document.getElementById("startGameDiv").style.display = "none";
    document.getElementById("scoreboardDiv").style.display = "flex";
    var scoreboardScores = document.getElementById("scores");
    if (localStorage.getItem("scoresArray") != null && scoreboardScores.innerHTML == '') {
        scoreboardScores.innerHTML += "<span style='font-size:30px'>Name</span><span style='font-size:30px'>Score</span>";
        for (var i = 0; i < scoresArray.length; i++) {
            scoreboardScores.innerHTML += "<span>" + nameOfScoresArray[i] + "</span><span>" + scoresArray[i] + "</span>";
        }
    }
})

//gets back to the main menu when user presses "back" on the scoreboard menu
document.getElementById("backToMainMenuBtn").addEventListener('click', function() {
    document.getElementById("startGameDiv").style.display = "flex";
    document.getElementById("scoreboardDiv").style.display = "none";
    document.getElementById("scores").innerHTML = '';
})

//saves user's name and score in the local storage
document.getElementById("saveScoreBtn").addEventListener('click', function() {
    var nameOfScore = document.getElementById("nameOfScore").value;
    if (nameOfScore == "") {
        alert("Please Enter Your Name");
        document.getElementById("nameOfScore").focus();
    } else {
        scoresArray.push(score);
        nameOfScoresArray.push(nameOfScore);
        for (var i = scoresArray.length - 1; i >= 0; i--) {
            if (scoresArray[i] > scoresArray[i - 1]) {
                var temp = scoresArray[i];
                scoresArray[i] = scoresArray[i - 1];
                scoresArray[i - 1] = temp;
                temp = nameOfScoresArray[i];
                nameOfScoresArray[i] = nameOfScoresArray[i - 1];
                nameOfScoresArray[i - 1] = temp;
            }
        }
        localStorage.setItem("scoresArray", JSON.stringify(scoresArray));
        localStorage.setItem("nameOfScoresArray", JSON.stringify(nameOfScoresArray));
        this.disabled = true;
    }
})

animatebackgroundMovement();