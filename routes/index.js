var express = require("express");
var router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "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",
});
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/", async function (req, res, next) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: req.body.text },
    ],
  });
  res.json({
    fulfillmentResponse: {
      messages: [
        {
          text: {
            text: [response.choices[0].message.content],
          },
        },
      ],
    },
  });
});
module.exports = router;
