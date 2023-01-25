const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 8080

app.use(express.json())
app.use(cors())


const start = async () => {
    try {
        app.listen(PORT, () => console.log(`server started, port:${PORT}`))
    } catch (error) {
        console.log(error)
    }
}
start()