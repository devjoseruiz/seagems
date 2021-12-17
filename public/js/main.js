GamePlayManager = {
    init: function(){
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
        game.scale.pageAlignHorizontally = true
        game.scale.pageAlignVertically = true

        this.flagFirstMouseDown = false
        this.endGame = false
        this.jewellsCollected = 0
        this.bubblesAmount = 30
        this.horseBlinks = false
    },
    preload: function(){
        // Load game assets
        game.load.image("background", "../assets/images/background.png")
        game.load.image("explosion", "../assets/images/explosion.png")
        game.load.image("shark", "../assets/images/shark.png")
        game.load.image("fishes", "../assets/images/fishes.png")
        game.load.image("mollusk", "../assets/images/mollusk.png")
        game.load.image("bubble1", "../assets/images/booble1.png")
        game.load.image("bubble2", "../assets/images/booble2.png")

        game.load.spritesheet("horse", "../assets/images/horse.png", 84, 156, 2)
        game.load.spritesheet("jewells", "../assets/images/diamonds.png", 81, 84, 4)
    },
    create: function(){
        this.screenXCenter = game.width / 2
        this.screenYCenter = game.height / 2
        // Render the sprites to the game
        game.add.sprite(0, 0, "background")

        this.bubbles = []
        for(var i = 0; i < this.bubblesAmount; i++){
            var bubbleX = game.rnd.integerInRange(1, 1140)
            var bubbleY = game.rnd.integerInRange(600, 950)

            var bubble = game.add.sprite(bubbleX, bubbleY, "bubble" + 
                game.rnd.integerInRange(1, 2))
            bubble.vel = 0.2 + game.rnd.frac() * 2
            bubble.alpha = 0.9
            bubble.scale.setTo(0.2 + game.rnd.frac())
            this.bubbles[i] = bubble
        }

        this.mollusk = game.add.sprite(500, 150, "mollusk")
        this.shark = game.add.sprite(500, 20, "shark")
        this.fishes = game.add.sprite(100, 550, "fishes")
        // Put the player in the center of the screen
        this.player = game.add.sprite(this.screenXCenter, this.screenYCenter, "horse")
        // Set the anchor, this is, the sprite center
        this.player.anchor.setTo(0.5, 0.5)
        this.player.frame = 0
        // Set the player velocity
        this.velocity = 2

        this.jewellsAmount = 30
        var jewellsPosXRange = [50, 1050]
        var jewellsPosYRange = [50, 600]
        this.jewells = []

        for (var i = 0; i < this.jewellsAmount; i++){
            // Randomize the jewell position in the screen
            var posX = game.rnd.integerInRange(...jewellsPosXRange)
            var posY = game.rnd.integerInRange(...jewellsPosYRange)
            var jewell = game.add.sprite(posX, posY, "jewells")
            // Randomize the look of the jewell
            jewell.frame = game.rnd.integerInRange(0, 3)
            // Randomize the jewell size
            jewell.scale.setTo(0.30 + game.rnd.frac())
            jewell.anchor.setTo(0.5, 0.5)

            this.jewells[i] = jewell
            var rectCurrentJewell = this.getBoundsSprite(jewell)
            var rectPlayer = this.getBoundsSprite(this.player)
            // Check for overlapping jewells and regenerate jewell position
            while(this.isOverlappingOthers(i, this.jewells, rectCurrentJewell) ||
                this.isRectangleOverlapping(rectPlayer, rectCurrentJewell)){
                    jewell.x = game.rnd.integerInRange(...jewellsPosXRange)
                    jewell.y = game.rnd.integerInRange(...jewellsPosYRange)

                    rectCurrentJewell = this.getBoundsSprite(jewell)
            }
        }

        // Animations for collected jewells
        this.explosionGroup = game.add.group()

        var explosionsAvailable = this.jewellsAmount * 30 / 100

        for(var i = 0; i < explosionsAvailable; i++){
            this.explosion = this.explosionGroup.create(0, 0, "explosion")
            this.explosion.anchor.setTo(0.5, 0.5)

            this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
                x: [0.4, 0.8, 0.4],
                y: [0.4, 0.8, 0.4]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false)

            this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
                alpha: [1, 0.6, 0]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false)

            this.explosion.kill()
        }

        // UI info
        this.maxPlayerScore = localStorage.getItem("maxPlayerScore") || 0
        this.playerScore = 0
        this.timeCount = 5

        var fontStyle = {
            font: "bold 30pt Arial",
            fill: "#FFFFFF",
            align: "center"
        }

        this.maxScoreText = game.add.text(60, 40,
            "Record: " + this.maxPlayerScore + " pts", fontStyle)
        this.maxScoreText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        this.maxScoreText.anchor.setTo(0, 0.5)

        this.scoreText = game.add.text(this.screenXCenter, 40,
            "Score: " + this.playerScore + " pts", fontStyle)
        this.scoreText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        this.scoreText.anchor.setTo(0.5, 0.5)

        this.timerText = game.add.text(1076, 40, "Time: " + this.timeCount + "s", fontStyle)
        this.timerText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        this.timerText.anchor.setTo(1, 0.5)

        this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function(){
            if(this.flagFirstMouseDown){
                this.timeCount--
                this.timerText.text = "Time: " + this.timeCount + "s"

                if(this.timeCount <= 0){
                    if(this.playerScore > this.maxPlayerScore){
                        localStorage.setItem("maxPlayerScore", this.playerScore)
                        this.maxScoreText.text = "Record: " + this.playerScore + " pts"
                        this.showFinalMessage("NEW RECORD!\n" +
                            this.playerScore + " pts\nCan you get even more?")
                    } else if(this.playerScore < this.maxPlayerScore) {
                        var neededToNewRecord = this.maxPlayerScore - this.playerScore
                        this.showFinalMessage("TRY AGAIN!\n" + "Just " +
                            neededToNewRecord + " pts more\nfor a new record!")
                    } else{
                        this.showFinalMessage("TRY AGAIN!")
                    }
                    this.time.events.remove(this.timerGameOver)
                    this.endGame = true
                }
            }
        }, this)

        // Player won't move until mouse clicks for first time
        game.input.onDown.add(this.onTap, this)
    },
    update: function(){
        if (this.flagFirstMouseDown && !this.endGame){
            for(var z = 0; z < this.bubblesAmount; z++){
                var bubble = this.bubbles[z]
                bubble.y -= bubble.vel

                if(bubble.y < -50){
                    bubble.y = 700
                    bubble.x = game.rnd.integerInRange(1, 1140)
                }
            }

            // Moves the shark from right to left
            this.shark.x--
            if(this.shark.x < -300){
                this.shark.x = 1300
            }

            this.fishes.x += 0.3
            if(this.shark.x > 1300){
                this.shark.x = -300
            }

            // Captures the mouse position
            var pointerX = game.input.x
            var pointerY = game.input.y

            // Calculates the distance between the player and the mouse position
            var distX = pointerX - this.player.x
            var distY = pointerY - this.player.y

            // Flip the player horizontally to left or right depending of the mouse position
            if (distX > 0) {
                this.player.scale.setTo(1, 1)
            } else {
                this.player.scale.setTo(-1, 1)
            }

            // Move the player
            this.player.x += distX * this.velocity / 100
            this.player.y += distY * this.velocity / 100

            // Detect collisions between the player and the jewells
            for(var i = 0; i < this.jewellsAmount; i++){
                var rectPlayer = this.getBoundsPlayer()
                var rectJewell = this.getBoundsSprite(this.jewells[i])

                if(this.jewells[i].visible &&
                    this.isRectangleOverlapping(rectPlayer, rectJewell)){
                        this.jewells[i].visible = false

                        this.increaseScore()

                        var explosion = this.explosionGroup.getFirstDead()
                        
                        if(explosion != null){
                            explosion.reset(this.jewells[i].x,
                                this.jewells[i].y)

                            explosion.tweenScale.start()
                            explosion.tweenAlpha.start()
                            explosion.tweenAlpha.onComplete.add(
                                function(currentTarget, currentTween){
                                    currentTarget.kill()
                            }, this)
                        }
                }
            }
        }
    },
    onTap: function(){
        if(!this.flagFirstMouseDown){
            this.tweenMollusk = game.add.tween(this.mollusk.position).to(
                {y: -0.001}, 5800, Phaser.Easing.Cubic.InOut, true, 0, 1000,
                true).loop(true)
        }
        this.flagFirstMouseDown = true
    },
    getBoundsSprite: function(currentSprite){
        return new Phaser.Rectangle(currentSprite.left, currentSprite.top,
            currentSprite.width, currentSprite.height)
    },
    // This is for avoiding errors because the player could be flipped
    getBoundsPlayer: function(){
        var axisX = this.player.x - Math.abs(this.player.width) / 4
        var width = Math.abs(this.player.width) / 2
        var axisY = this.player.y - this.player.height / 2
        var height = this.player.height

        return new Phaser.Rectangle(axisX, axisY, width, height)
    },
    // Check if two jewells are overlapping
    isRectangleOverlapping: function(rect1, rect2){
        if(rect1.x > rect2.x + rect2.width || rect2.x > rect1.x + rect1.width){
            return false
        }
        
        if(rect1.y > rect2.y + rect2.height || rect2.y > rect1.y + rect1.height){
            return false
        }

        return true
    },
    // Check entire array in search of overlapping elements
    isOverlappingOthers: function(index, elements, rect2){
        for(var i = 0; i < index; i++){
            var rect1 = this.getBoundsSprite(elements[i])

            if(this.isRectangleOverlapping(rect1, rect2)){
                return true
            }
        }

        return false
    },
    increaseScore: function(){
        this.playerScore += 10
        this.scoreText.text = "Score: " + this.playerScore + " pts"
        this.jewellsCollected++

        if(this.horseBlinks){
            this.horseBlinks = false
            this.player.frame = 0
        } else{
            this.horseBlinks = true
            this.player.frame = 1
            this.timeCount++
            this.timerText.text = "Time: (+1) " + this.timeCount + "s"
        }

        if(this.jewellsCollected >= this.jewellsAmount){
            var jewellsToAppear = game.rnd.integerInRange(1, this.jewellsAmount / 2)
            this.jewellsCollected -= jewellsToAppear
            for(var i = 0; i < jewellsToAppear; i++){
                var tryAgain = true
                while(tryAgain){
                    var index = game.rnd.integerInRange(0, this.jewellsAmount - 1)
                    if(this.jewells[index].visible == false){
                        this.jewells[index].visible = true
                        tryAgain = false
                    }
                }
            }
        }
    },
    showFinalMessage: function(message){
        this.tweenMollusk.stop()
        var bgAlpha = game.add.bitmapData(game.width, game.height)
        bgAlpha.ctx.fillStyle = "#000000"
        bgAlpha.ctx.fillRect(0, 0, game.width, game.height)

        var bg = game.add.sprite(0, 0, bgAlpha)
        bg.alpha = 0.5

        var fontStyle = {
            font: "bold 48pt Arial",
            fill: "#FFFFFF",
            align: "center"
        }

        this.textFieldFinalMessage = game.add.text(this.screenXCenter, this.screenYCenter,
            message, fontStyle)
        this.textFieldFinalMessage.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        this.textFieldFinalMessage.anchor.setTo(0.5, 0.5)
    }
}

var game = new Phaser.Game(1136, 640, Phaser.CANVAS)

game.state.add("gameplay", GamePlayManager)
game.state.start("gameplay")
