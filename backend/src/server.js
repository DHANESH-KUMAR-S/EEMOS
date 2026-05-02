const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/notes',   require('./routes/notes'));
app.use('/api/files',   require('./routes/files'));
app.use('/api/desktop', require('./routes/desktop'));
app.use('/api/apps',    require('./routes/apps'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
