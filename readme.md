# Figgs ![Figgs Logo](https://raw.github.com/BusyRich/node-figgs/master/logo.png)
A delicious way to manage configurations in node.js.

The power of Figgs comes from the ability to store all your various configurations in one JSON file, and use the correct configuration for the environment in which your application without writing any logic to do so. What makes Figgs different is its hierarchy of "figgs" which allows you to define one base configuration and extend from it for other configurations. There are also a few juicy features that make building your configuration a little easier.

## Install
    
    npm install figgs

## Quick Use
Given the follow JSON file:

```javascript
    {
      "development": {
        "port": 9999,
        "unchanged": "value",
        "stagingoverride": "value",
        "productionoverride": "value",
      },
      "staging": {
        "stagingoverride": "staging value",
        "stagingvalue": "value"
      },
      "production": {
        "productionoverride": "production value",
        "productionvalue": "value"
      }
    }
```

You can include it for use like so:

```javascript
    //process.env.NODE_ENV = "production"
    var myfigg = require('figgs').load('myfiggs');
    console.log(myFigg.productionoverride); //production value
```

Figgs will automatically look for the NODE_ENV environment variable and load the configuration with the name of the value. If no NODE_ENV is present, it will use the first figg in the hierarchy, which defaults to development.

## How It Works
Figgs utilizes a hierarchy of configurations to build the configurations before one is chosen. This hierarchy defaults to development, then staging, then production. What this means is that staging will extend development, and production will extend staging. This allows you to define a "base" configuration with most of the properties that will be used in all configurations, and just change or add the properties that environment needs. 

For example, the port property might not change at all between all the configurations while a database connection will. You can define the port in the development configuration, while the staging and production configurations will just contain a database connection. The port will be part of the later two without explicitly defining it.
    
```javascript
    {
      "development": {
        "port": 9999,
        "conn_str": "localhost:3233/db"
      },
      "staging": {
        "conn_str": "staginghost:3233/db"
      },
      "production": {
        "conn_str": "prodhost:3233/db"
      }
    }
```
    
Of course you may want to remove properties down the line. This is done by simply setting a property to `null`.

```javascript
    {
      "development": {
        "devonly": "value" 
      },
      "staging": {
        "devonly": null
      },
      "production": {}
    }
```

## Options
There are options that allow you to control the behavior of Figgs. However rather than passing them into the load function you define your options in the configuration file itself. You simply add an `options` property and add the options you would like to set.

```javascript
    {
      "development": {
        "port": 9999,
        "conn_str": "localhost:3233/db"
      },
      "staging": {
        "conn_str": "staginghost:3233/db"
      },
      "production": {
        "conn_str": "prodhost:3233/db"
      }
      "options" {
        "someoption": "value"
      }
    }
```

#### environments
This allows you to rename or define the environments used in your application. For example, if you would like to use the name "prod" for the production environment.

```javascript
    {
      "development": {
        "port": 9999,
        "conn_str": "localhost:3233/db"
      },
      "staging": {
        "conn_str": "staginghost:3233/db"
      },
      "prod": {
        "conn_str": "prodhost:3233/db"
      }
      "options" {
        "environments": {
            "production": "prod"
        }
      }
    }
```

You can also add new environments as well. The key is the name used in the hierarchy, and the value is used for the NODE_ENV value and name of the configuration in the file.

```javascript
    {
      "development": {
        "port": 9999,
        "conn_str": "localhost:3233/db"
      },
      "staging": {
        "conn_str": "staginghost:3233/db"
      },
      "production": {
        "conn_str": "prodhost:3233/db"
      },
      "totally" : {
        "conn_str": "wayback:80/db"
      }
      "options" {
        "environments": {
            "awesome": "totally"
        }
      }
    }
```

#### hierarchy
This defines the order in which configurations are extended. All configurations have to be defined in the hierarchy in order to be included as a usable configuration. Taking the custom environment above, assuming you want them extended in the order they appear.

```javascript
    {
      "development": {
        "port": 9999,
        "conn_str": "localhost:3233/db"
      },
      "staging": {
        "conn_str": "staginghost:3233/db"
      },
      "production": {
        "conn_str": "prodhost:3233/db"
      },
      "totally" : {
        "conn_str": "wayback:80/db"
      }
      "options" {
        "environments": {
          "awesome": "totally"
        },
        hierarchy: [
          'development',
          'staging',
          'production',
          'awesome'
        ]
      }
    }
```
## Placeholders
Since a JSON file is just an object, and not free-flowing javascript, there are certain things you cannot add to your configuration. Take an environment variable for example. Most applications will use a `PORT` environment variable that tell the application what port to listen to. You simple cannot put that kind of information inside a JSON file.

This is where placeholders come in. They are strings that reference a value for dynamic lookup later. All you have to do is set a property to a placeholder string and it will be interpreted and filled when the configuration is loaded.

### var | &lt;var.[variable] [default]&gt;
Gets the value of an environment variable.

```javascript
    {
      "development": {
        "port": "<var.port 9999>",
        "conn_str": "localhost:3233/db"
      }
    }
```

### figg | &lt;figg[.[path]]&gt;
Retrieves another value in the same configuration, starting at the root.

```javascript
    {
      "development": {
        "port": "<var.PORT 9999>",
        "nested": {
           "value": "<figg.this.is.a.nested.object>"
        },
        "unchanged": "value",
        "stagingoverride": "value",
        "productionoverride": "value",
        "this": {
          "is": {
            "a": {
              "nested": {
                "object": "I am really nested"
              }
            }
          }
        }
      }
    }
```

## Errors
Most applications will load a configuration before doing anything else. They are mission critical, and when something is off things blow up. With this in mind Figgs uses only synchronous methods and will always throw an error when in doubt, instead of returning one. This prevents an application from loading in a wrong or misconfigured one, as well as allowing the application to wait for the configuration to load before moving on.


