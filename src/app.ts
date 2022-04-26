import express from "express";
import helmet from "helmet";
import path from "path";
import morgan from "morgan";
import routes from "./routes";
const bodyParser = require('body-parser');


const app = express();
app.use(morgan('[:date[iso]] ":method :url HTTP/:http-version" :url :status :res[content-length] - :response-time ms'));
app.set('port', process.env.PORT || 3000);
app.use(helmet());
//app.use(helmet.noCache());
app.use(helmet.frameguard());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use("/", routes);

const port = 3000;

app.listen(port, () => {
    console.log(`NFT app listening to port ${port}`);
})