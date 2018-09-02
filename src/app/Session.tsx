import * as React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { Row, Column } from "hedron";
import Sockette from "sockette";
import * as autobind from "auto-bind";
import { Button } from "./atoms";
import { ButtonGroup } from "./molecules";

interface Props extends RouteComponentProps<any> {}

type Story = {
  id: string;
  name: string;
  url?: string;
  votes: { [clientId: string]: number };
};

type Client = {
  id: string;
  name: string;
};

type State = {
  stories: Story[];
  clients: Client[];
  currentStoryIndex: number;
  isAdmin: boolean;
  connected: boolean;
  clientId: string;
};

class Session extends React.Component<Props, State> {
  state: State = {
    stories: [],
    clients: [],
    clientId: "",
    currentStoryIndex: 0,
    isAdmin: true,
    connected: false
  };

  clientId!: string;
  socket: Sockette;

  constructor(props: Props) {
    super(props);
    autobind.react(this);
  }

  componentDidMount() {
    const { sessionId } = this.props.match.params;

    this.socket = new Sockette("ws://localhost:9001", {
      onopen: () => {
        this.setState({ connected: true });
        this.socket.json({
          action: "join",
          payload: { sessionId, name: "Ben" }
        });
      },
      onmessage: (message: any) => {
        const data = JSON.parse(message.data);
        if (data.action === `state:${sessionId}`) {
          this.setState({
            stories: data.payload.session.stories,
            clients: data.payload.session.clients,
            clientId: data.payload.clientId
          });
        }
      }
    });
  }

  componentWillUnmount() {
    if (this.socket) {
      this.socket.close();
    }
  }

  everyoneHasVoted(story: Story) {
    return this.state.clients.every(client => !!story.votes[client.id]);
  }

  voteForStory(storyId: string, clientId: string, vote: number) {
    this.socket.json({
      action: "vote",
      payload: {
        storyId,
        clientId,
        vote,
        sessionId: this.props.match.params.sessionId
      }
    });
  }

  resetVotes(storyId: string) {
    this.socket.json({
      action: "resetVotes",
      payload: {
        storyId,
        sessionId: this.props.match.params.sessionId
      }
    });
  }

  goToStory(currentStoryIndex: number) {
    this.setState({ currentStoryIndex });
  }

  render() {
    const {
      stories,
      clients,
      currentStoryIndex,
      isAdmin,
      connected,
      clientId
    } = this.state;
    const currentStory = stories[currentStoryIndex];
    return (
      connected && (
        <Row>
          <Column lg={10}>
            {currentStory && (
              <div>
                <h2>
                  <a href={currentStory.url}>{currentStory.name}</a>
                </h2>

                {clients.map((client, index) => (
                  <div key={index}>
                    <h3>{client.name}</h3>
                    {(this.everyoneHasVoted(currentStory) ||
                      client.id === this.clientId) && (
                      <p>{currentStory.votes[client.id]}</p>
                    )}
                  </div>
                ))}

                {!this.everyoneHasVoted(currentStory) && (
                  <ButtonGroup>
                    {[2, 3, 5, 8].map(number => (
                      <Button
                        key={number}
                        onClick={() =>
                          this.voteForStory(currentStory.id, clientId, number)
                        }
                        type="button"
                      >
                        {number}
                      </Button>
                    ))}
                  </ButtonGroup>
                )}

                {!currentStory && <h2>Waiting to start</h2>}

                {isAdmin &&
                  this.everyoneHasVoted(currentStory) && (
                    <div>
                      <Button
                        type="button"
                        onClick={() => this.resetVotes(currentStory.id)}
                      >
                        Revote
                      </Button>
                    </div>
                  )}

                {isAdmin && (
                  <ButtonGroup>
                    <Button
                      type="button"
                      disabled={!stories[currentStoryIndex - 1]}
                      onClick={() => this.goToStory(currentStoryIndex - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      disabled={!stories[currentStoryIndex + 1]}
                      onClick={() => this.goToStory(currentStoryIndex + 1)}
                    >
                      Next
                    </Button>
                  </ButtonGroup>
                )}
              </div>
            )}
          </Column>

          <Column lg={2}>
            {stories.map((story, index) => (
              <a key={index} href={story.url}>
                {story.name}
              </a>
            ))}
          </Column>
        </Row>
      )
    );
  }
}

export default withRouter(Session);
