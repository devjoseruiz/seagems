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
    },
    create: function(){
        // Render the player sprite to the game
        game.add.sprite(0, 0, "background")
        this.horse = game.add.sprite(0, 0, "horse")
        // Set the anchor, this is, the sprite center
        this.horse.anchor.setTo(0.5, 0.5)
        this.horse.frame = 0
        // Put the player in the center of the screen
        this.horse.x = game.width / 2
        this.horse.y = game.height / 2
        // Set the player velocity
        this.velocity = 2
        // Player won't move until mouse clicks for first time
        game.input.onDown.add(this.onTap, this)
    },
    update: function(){
        if (this.flagFirstMouseDown){
            // Captures the mouse position
            var pointerX = game.input.x
            var pointerY = game.input.y

            // Calculates the distance between the player and the mouse position
            var distX = pointerX - this.horse.x
            var distY = pointerY - this.horse.y

            // Flip the player horizontally to left or right depending of the mouse position
            if (distX > 0) {
                this.horse.scale.setTo(1, 1)
            } else {
                this.horse.scale.setTo(-1, 1)
            }

            // Move the player
            this.horse.x += distX * this.velocity / 100
            this.horse.y += distY * this.velocity / 100
        }

    },
    onTap: function(){
        this.flagFirstMouseDown = true
    }
}

var game = new Phaser.Game(1136, 640, Phaser.CANVAS)

game.state.add("gameplay", GamePlayManager)
game.state.start("gameplay")
