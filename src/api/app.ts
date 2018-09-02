import {
  server as WebSocketServer,
  request as WebSocketRequest
} from "websocket";
import * as http from "http";
import * as uuid from "uuid";
import * as pinot from "pino";

const logger = pinot();

type Story = {
  id: string;
  name: string;
  url?: string;
  votes: { [clientId: string]: number };
};

type Client = {
  name: string;
  id: string;
};

type Session = {
  stories: Story[];
  clients: Client[];
};

interface IMessage {
  action: string;
  payload: any;
}

const sessions = new Map<string, Session>();

sessions.set("1234", {
  stories: [
    {
      id: "1234",
      name: "Story A",
      url: "https://google.com/hello",
      votes: {}
    },
    {
      id: "1236",
      name: "Story B",
      url: "https://google.com/b",
      votes: {}
    }
  ],
  clients: []
});

const httpServer = http.createServer((_, response) => {
  response.writeHead(404);
  response.end();
});

httpServer.listen(9001, () => {
  logger.info(`API listening on 9001`);
});

const webSocketServer = new WebSocketServer({ httpServer });

webSocketServer.on("request", (request: WebSocketRequest) => {
  const connection = request.accept(undefined, request.origin);
  const id = uuid.v4();

  logger.info(`connection accepted for ${id}`);

  connection.on("message", incomingMessage => {
    if (incomingMessage.type === "utf8" && incomingMessage.utf8Data) {
      const message: IMessage = JSON.parse(incomingMessage.utf8Data);

      if (message.action === "join") {
        const {
          sessionId,
          name
        }: { sessionId: string; name: string } = message.payload;
        const session = sessions.get(sessionId);
        if (session) {
          session.clients = session.clients.concat([{ name, id }]);
          sessions.set(sessionId, session);
          connection.sendUTF(
            JSON.stringify({
              action: `state:${sessionId}`,
              payload: { session, clientId: id }
            })
          );
        } else {
          connection.sendUTF(
            JSON.stringify({
              action: "error",
              paylod: { message: "Session not found" }
            })
          );
        }
      } else if (message.action === "vote") {
        const {
          sessionId,
          storyId,
          clientId,
          vote
        }: {
          sessionId: string;
          storyId: string;
          clientId: string;
          vote: number;
        } = message.payload;
        const session = sessions.get(sessionId);
        if (session) {
          session.stories = session.stories.map(story => {
            if (story.id === storyId) {
              story.votes[clientId] = vote;
            }

            return story;
          });
          sessions.set(sessionId, session);
          webSocketServer.broadcastUTF(
            JSON.stringify({
              action: `state:${sessionId}`,
              payload: { session, clientId: id }
            })
          );
        }
      } else if (message.action === "resetVotes") {
        const {
          sessionId,
          storyId
        }: {
          sessionId: string;
          storyId: string;
        } = message.payload;
        const session = sessions.get(sessionId);
        if (session) {
          session.stories = session.stories.map(story => {
            if (story.id === storyId) {
              story.votes = {};
            }

            return story;
          });
          sessions.set(sessionId, session);
          webSocketServer.broadcastUTF(
            JSON.stringify({
              action: `state:${sessionId}`,
              payload: { session, clientId: id }
            })
          );
        }
      }
    }
  });
});

process.once("SIGUSR2", () => {
  webSocketServer.shutDown();
  process.kill(process.pid, "SIGUSR2");
});
