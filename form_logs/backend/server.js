import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import dotenv from 'dotenv';

const app = express();
const port = 3000;

dotenv.config();

// Initialisation Sentry
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

// Middleware Sentry
console.dir(Sentry);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize the OpenAI API client directly with the API key
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Routes
app.get("/", (req, res) => {
    res.send("Formulaire simple");
});

app.post("/submit_form", (req, res) => {
    try {
        const { name, email, message } = req.body;
        console.log(name, email, message);
        // Simuler une erreur pour démonstration
        //throw new Error("Erreur dans le traitement du formulaire !");
    } catch (err) {
        Sentry.captureException(err); // Capture manuelle
        res.status(500).send("Une erreur est survenue !");
    }
});

// Endpoint to handle chat POST requests
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).send("Message is required");
    }

    try {
        const botResponse = await getChatbotResponse(userMessage);
        const userChatMessage = new ChatMessage({
        message: userMessage,
        sender: 'User',
        });
        await userChatMessage.save();
        const botChatMessage = new ChatMessage({
        message: botResponse,
        sender: 'Bot',
        });
        await botChatMessage.save();
        res.json({ userMessage, botResponse });
    } catch (error) {
        console.error("Error processing chat request:", error);
        res.status(500).send("Error processing request");
    }
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});