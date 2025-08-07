// Dynamic import for Phaser to avoid SSR issues
let Phaser = null;
if (typeof window !== 'undefined') {
    Phaser = require('phaser');
}

export class Boot extends (Phaser?.Scene || Object)
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/bg.png');
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
