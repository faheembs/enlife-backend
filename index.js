
const server = require("./src/app");
const connectDB = require("./src/config/database")

connectDB().then(res => {
    const port = process.env.PORT || 8000;
    server.listen(port, () => console.log(`Enlife APIs running on http://localhost:${port} `));
})
// async () => {
//     await connectDB()

// }
