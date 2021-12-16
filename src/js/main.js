GamePlayManager = {
    init: function(){
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
        game.scale.pageAlignHorizontally = true
        game.scale.pageAlignVertically = true

        this.flagFirstMouseDown = false
    },
    preload: function(){
        // Load game assets
        game.load.image("background", "../../assets/images/background.png")
        game.load.spritesheet("horse", "../../assets/images/horse.png", 84, 156, 2)
        game.load.spritesheet("jewells", "../../assets/images/diamonds.png", 81, 84, 4)
    },
    create: function(){
        // Render the player sprite to the game
        game.add.sprite(0, 0, "background")
        // Put the player in the center of the screen
        this.player = game.add.sprite(game.width / 2, game.height / 2, "horse")
        // Set the anchor, this is, the sprite center
        this.player.anchor.setTo(0.5, 0.5)
        this.player.frame = 0
        // Set the player velocity
        this.velocity = 2

        var jewellsAmount = 30
        var jewellsPosXRange = [50, 1050]
        var jewellsPosYRange = [50, 600]
        this.jewells = []

        for (var i = 0; i < jewellsAmount; i++){
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

        // Player won't move until mouse clicks for first time
        game.input.onDown.add(this.onTap, this)
    },
    update: function(){
        if (this.flagFirstMouseDown){
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
        }
    },
    onTap: function(){
        this.flagFirstMouseDown = true
    },
    getBoundsSprite: function(currentSprite){
        return new Phaser.Rectangle(currentSprite.left, currentSprite.top,
            currentSprite.width, currentSprite.height)
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
    }
}

var game = new Phaser.Game(1136, 640, Phaser.CANVAS)

game.state.add("gameplay", GamePlayManager)
game.state.start("gameplay")
