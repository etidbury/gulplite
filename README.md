# Gulp Lite

Gulp Lite primarily helps reduce the number of files within your project by packaging all the common gulp tasks, and exposing only the necessary configuration parameters for customisation.



##Usage

1. #####Install via command line:

    ```bash
    npm install gulplite --save-dev
    ```

2. #####Configure for your project:

    *Note: all parameters values are optional and defaults to values specified here*
    
    ```json
    {
        "name":"my-project-name",
        //...
        "config":{
     
          "gulplite":{
       
                "browserPort": 3000,
                "UIPort": 3001,
                "scripts": {
                  "src": "./app/js/**/*.js",
                  "dest": "./build/js/",
                  "test": "./tests/**/*.js",
                  "gulp": "./gulp/**/*.js"
                },
                "images": {
                  "src": "./app/img/**/*.{jpeg,jpg,png,gif}",
                  "dest": "./build/img/"
                },
                "styles": {
                  "src": "./app/sass/**/*.scss",
                  "dest": "./build/css/"
                },
                "sourceDir": "./app/",
                "buildDir": "./build/",
                "testFiles": "./tests/**/*.{js,jsx}",
                "browserSync": {
                  "defaultFile": "index.html",
                  "assetExtensions": [
                    "js",
                    "css",
                    "map",
                    "png",
                    "jpe?g",
                    "gif",
                    "svg",
                    "eot",
                    "otf",
                    "ttc",
                    "ttf",
                    "woff2?"
                  ]
                },
                "browserify": {
                  "outputFileName": "main",
                  "defaultFile": "index.js"
                }
          }
        }
        
        //...
    }
    ```