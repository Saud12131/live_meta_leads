import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
const app = express();
dotenv.config();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: "server running at 3000" })
})

io.on('connection', (socket) => {
  console.log('RN app connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('RN app disconnected:', socket.id);
  });
});

// Meta webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    console.log('Webhook verified!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Meta sends lead event here
app.post('/webhook', async (req, res) => {
    console.log("🔥🔥 WEBHOOK HIT 🔥🔥");
  const body = req.body;
  console.log('RAW BODY:', JSON.stringify(req.body)); 
  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'leadgen') {
          const leadgenId = change.value.leadgen_id;
          console.log('New lead ID:', leadgenId);

          try {
            const { data } = await axios.get(
              `https://graph.facebook.com/v19.0/${leadgenId}`,
              { params: { access_token: process.env.PAGE_ACCESS_TOKEN } }
            );

            const fields = {};
            data.field_data.forEach(f => {
              fields[f.name] = f.values[0];
            });

            const lead = {
              id: data.id,
              created_time: data.created_time,
              name: fields['full_name'] || fields['name'] || 'Unknown',
              email: fields['email'] || '',
              phone: fields['phone_number'] || '',
            };

            console.log('Parsed lead:', lead);

            io.emit('new_lead', lead);

          } catch (err) {
            console.error('Error fetching lead:', err.response?.data || err.message);
          }
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});





server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});