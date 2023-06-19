const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const fs = require("fs")

// To access JSON
app.use(express.json())

// Reassignning Users to array from file if any exist
let users = [];

fs.readFile('users.json', 'utf8', (err, json) => {
    if (err) {
        console.error(err)
    }
    if (json.length !== 0) {
        users = JSON.parse(json)
    }
    // if(json.length == 0){
    //     return
    // }else{
    //     users = JSON.parse(json)
    // }

})


// All Users
app.get('/', (req, res) => {
    res.json(users)
})


// Middleware Code Start

const verifyToken = (req, res, next) => {
    const header = req.headers['authorization'];
    if (typeof header !== 'undefined') {
        const bearer = header.split(" ");
        const token = bearer[1];
        req.token = token;
        next()
    } else {
        res.json({ error: "Token is Invalid" })
    }
}

// Middleware Code End


//Profile Code Start

app.post("/profile", verifyToken, (req, res) => {
    const authData = jwt.verify(req.token, secretKey);

    if (authData) {
        res.json({
            message: "Profile Accessed",
            authData
        })
    } else {
        res.json({ error: "Invild Token" })
    }
})



//Profile Code End


// Login Code
const secretKey = "HELLOMYNAMEISAHMAD"

app.post("/login", (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.json({ Alert: "Plz fill all the fields" })
        }

        if (users.length !== 0) {
            users.map(user => {
                if (email != user.email) {
                    return res.json({ error: "User not Found" })
                } else {
                    if (password != user.password) {
                        return res.json({ error: "Invalid Credentials" })
                    } else {
                        const token = jwt.sign({ users }, secretKey, {
                            expiresIn: '7d'
                        })
                        res.json({ Success: "Login Successfully...", token })
                    }
                }


            })
        }
        else {
            return res.json({ error: "User not Found" })
        }
    } catch (err) {
        res.send(err)
    }

})

// Login Code End 




// Create or Register User Start
app.post("/register", (req, res) => {

    let id = Math.floor(Math.random() * 100);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.json({ Alert: "Plz fill all the fields" })
    }

    if (users.length !== 0) {

        const findUser = (user) => {
            return user.email === email
        }
        const userExists = users.find(findUser)

        if(userExists){
            return res.json({ Alert: "User Already Exists..." })
        }else{
            users.push({ id, username, email, password })
                fs.writeFile('users.json', JSON.stringify(users), (error) => {
                    if (error) {
                        res.json({ error: 'An error has occurred ' });
                        return;
                    }
                    return res.json({ message: 'User created Successfully and Added to File' });
                }); 
        }
    } else {
        users.push({ id, username, email, password })
        fs.writeFile('users.json', JSON.stringify(users), (error) => {
            if (error) {
                res.json({ error: 'An error has occurred ' });
                return;
            }
            res.json({ message: 'User created Successfully and Added to File' });
        });
    }
})

// Create or Register User End

// Update User Start
app.put('/updateUser/:id', verifyToken, (req, res) => {
    const {username, email, password} = req.body;
    const userId = req.params.id;

    if (!username || !email || !password) {
        res.json({ Alert: "Plz fill all the fields" })
    }

    const findUser = (user) => {
         if (user.id == userId){
             user.username = username,
             user.email = email,
             user.password = password
         }
    }
    users.find(findUser)
    fs.writeFile('users.json', JSON.stringify(users), (error) => {
        if (error) {
            res.json({ error: 'An error has occurred ' });
            return;
        }
        return res.json({ message: 'User Updated' });
    }); 

    res.json({success: "User Updated"})


//     users = users.filter(user => user.id != userId)
//     fs.writeFile('users.json', JSON.stringify(users), (error) => {
//         if (error) {
//             res.json({ error: 'An error has occurred ' });
//             return;
//         }
//         res.json({ message: 'File Updated' });
//     });
//     res.json({ Alert: "User Deleted", users })
 })

// Update User End



// Delete User Start
app.delete('/deleteUser/:id', verifyToken, (req, res) => {
    const userId = req.params.id;

    users = users.filter(user => user.id != userId)
    fs.writeFile('users.json', JSON.stringify(users), (error) => {
        if (error) {
            res.json({ error: 'An error has occurred ' });
            return;
        }
        res.json({ message: 'File Updated' });
    });
    res.json({ Alert: "User Deleted", users })
})

// Delete User End


app.listen(3000, () => {
    console.log("Server is Running on port 3000...")
})
