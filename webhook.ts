import * as express from "express";

interface FulfillmentInfo {
  tag: string;
}

interface SessionInfo {
  session: string;
  parameters: { [key: string]: any };
}

interface Text {
  text: string[];
}

interface ResponseMessage {
  text: Text;
}

interface FulfillmentResponse {
  messages: ResponseMessage[];
}

interface WebhookRequest {
  fulfillmentInfo: FulfillmentInfo;
  sessionInfo: SessionInfo;
}

interface WebhookResponse {
  fulfillmentResponse: FulfillmentResponse;
  sessionInfo: SessionInfo;
}

// confirm handles webhook calls using the "confirm" tag.
function confirm(request: WebhookRequest): WebhookResponse {
  // Create a text message that utilizes the "size" and "color"
  // parameters provided by the end-user.
  // This text message is used in the response below.
  const t = `You can pick up your order for a ${request.sessionInfo.parameters["size"]} ${request.sessionInfo.parameters["color"]} shirt in 5 days.`;

  // Create session parameters that are populated in the response.
  // The "cancel-period" parameter is referenced by the agent.
  // This example hard codes the value 2, but a real system
  // might look up this value in a database.
  const p: { [key: string]: any } = { "cancel-period": "2" };

  // Build and return the response.
  const response: WebhookResponse = {
    fulfillmentResponse: {
      messages: [
        {
          text: {
            text: [t],
          },
        },
      ],
    },
    sessionInfo: {
      parameters: p,
      session: request.sessionInfo.session,
    },
  };
  return response;
}

// handleError handles internal errors.
function handleError(res: express.Response, err: Error) {
  res.status(500).send(`ERROR: ${err}`);
}

// HandleWebhookRequest handles WebhookRequest and sends the WebhookResponse.
export function handleWebhookRequest(
  req: express.Request,
  res: express.Response
) {
  const request: WebhookRequest = req.body;
  let response: WebhookResponse;
  let err: Error | null = null;

  // Get the tag from the request, and call the corresponding
  // function that handles that tag.
  // This example only has one possible tag,
  // but most agents would have many.
  const tag = request.fulfillmentInfo.tag;
  switch (tag) {
    case "confirm":
      response = confirm(request);
      break;
    default:
      err = new Error(`Unknown tag: ${tag}`);
  }

  if (err) {
    handleError(res, err);
    return;
  }

  // Send response
  res.json(response);
}

// // Create an Express.js app and handle Webhook requests.
// const app = express();
// app.use(express.json());
// app.post('/webhook', handleWebhookRequest);
//
// // Start the server
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Listening on port ${port}`);
// });
