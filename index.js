import express from "express"

const app = express()
app.use(express.json())

const API_KEY = process.env.API_KEY || "CHANGE_ME"
const PORT = process.env.PORT || 3000

let cursor = 0
let bans = []
let unbans = []

function checkKey(req, res, next) {
  if (req.query.key !== API_KEY && req.body.key !== API_KEY) {
    return res.status(403).json({ error: "bad key" })
  }
  next()
}

app.post("/push_ban", checkKey, (req, res) => {
  const { uid, time, reason, name, admin } = req.body
  if (!uid) return res.status(400).json({ error: "uid missing" })

  cursor++
  bans.push({
    id: cursor,
    uid,
    time: Number(time) || 0,
    reason: reason || "",
    name: name || "",
    admin: admin || ""
  })

  res.json({ ok: true })
})

app.post("/push_unban", checkKey, (req, res) => {
  const { uid } = req.body
  if (!uid) return res.status(400).json({ error: "uid missing" })

  cursor++
  unbans.push({ id: cursor, uid })

  res.json({ ok: true })
})

app.get("/pull", checkKey, (req, res) => {
  const since = Number(req.query.cursor || 0)

  res.json({
    cursor,
    bans: bans.filter(b => b.id > since),
    unbans: unbans.filter(u => u.id > since)
  })
})

app.listen(PORT, () => {
  console.log("BanSync API running on port", PORT)
})
