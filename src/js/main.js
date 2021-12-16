GamePlayManager = {
    init: function(){
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
        game.scale.pageAlignHorizontally = true
        game.scale.pageAlignVertically = true

        this.flagFirstMouseDown = false
        this.endGame = false
        this.jewellsCollected = 0
    },
    preload: function(){
        // Load game assets
        game.load.image("background", "../../assets/images/background.png")
        game.load.image("explosion", "../../assets/images/explosion.png")

        game.load.spritesheet("horse", "../../assets/images/horse.png", 84, 156, 2)
        game.load.spritesheet("jewells", "../../assets/images/diamonds.png", 81, 84, 4)
    },
    create: function(){
        this.screenXCenter = game.width / 2
        this.screenYCenter = game.height / 2
        // Render the player sprite to the game
        game.add.sprite(0, 0, "background")
        // Put the player in the center of the screen
        this.player = game.add.sprite(this.screenXCenter, this.screenYCenter, "horse")
        // Set the anchor, this is, the sprite center
        this.player.anchor.setTo(0.5, 0.5)
        this.player.frame = 0
        // Set the player velocity
        this.velocity = 2

        this.jewellsAmount = 25
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
        this.playerScore = 0
        this.timeCount = 5

        var fontStyle = {
            font: "bold 30pt Arial",
            fill: "#FFFFFF",
            align: "center"
        }

        this.scoreText = game.add.text(this.screenXCenter, 40,
            this.playerScore + " pts", fontStyle)
        this.scoreText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        this.scoreText.anchor.setTo(0.5, 0.5)

        this.timerText = game.add.text(1000, 40, this.timeCount + "s", fontStyle)
        this.timerText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
        this.timerText.anchor.setTo(0.5, 0.5)

        this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function(){
            if(this.flagFirstMouseDown){
                this.timeCount--
                this.timerText.text = this.timeCount + "s"

                if(this.timeCount <= 0){
                    this.time.events.remove(this.timerGameOver)
                    this.showFinalMessage("GAME OVER")
                    this.endGame = true
                }
            }
        }, this)

        // Player won't move until mouse clicks for first time
        game.input.onDown.add(this.onTap, this)
    },
    update: function(){
        if (this.flagFirstMouseDown && !this.endGame){
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
        this.scoreText.text = this.playerScore + " pts"
        this.jewellsCollected++
        this.timeCount++

        if(this.jewellsCollected >= this.jewellsAmount){
            this.time.events.remove(this.timerGameOver)
            this.showFinalMessage("YOU WIN")
            this.endGame = true
        }
    },
    showFinalMessage: function(message){
        var bgAlpha = game.add.bitmapData(game.width, game.height)
        bgAlpha.ctx.fillStyle = "#000000"
        bgAlpha.ctx.fillRect(0, 0, game.width, game.height)

        var bg = game.add.sprite(0, 0, bgAlpha)
        bg.alpha = 0.5

        var fontStyle = {
            font: "bold 60pt Arial",
            fill: "#FFFFFF",
            align: "center"
        }

        this.textFieldFinalMessage = game.add.text(this.screenXCenter, this.screenYCenter,
            message, fontStyle)
        this.textFieldFinalMessage.anchor.setTo(0.5, 0.5)
    }
}

var game = new Phaser.Game(1136, 640, Phaser.CANVAS)

game.state.add("gameplay", GamePlayManager)
game.state.start("gameplay")
