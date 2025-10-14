import express from 'express';

const app = express();


app.use(express.static('public'));


app.get('/api/random-cat', (_req, res) => {
    const isGif = Math.random() > 0.5;
    const stamp = Date.now();
    const url = isGif
        ? `https://cataas.com/cat/gif?random=${stamp}`
        : `https://cataas.com/cat?width=400&random=${stamp}`;
    res.json({ url });
});


export default app;

