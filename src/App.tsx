import React, {Component} from 'react';
import './App.css';
import {Container, Row, Col} from "react-bootstrap";

interface MagicCardFace {
    name: string;
}

interface MagicCard {
    faces: MagicCardFace[];
    eurPrice: number;
    usdPrice: number;
}

interface AppState {
    cards: MagicCard[];
    precons: { [key: string]: MagicCard };
    selectedPrecon: string;
    loading: boolean;
}

class App extends Component<{}, AppState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            cards: [],
            precons: {},
            selectedPrecon: '',
            loading: false
        }
    }


    componentDidMount() {
        fetch('/api/precons/withCommander', {
            headers: [
                ['Accept', 'application/json'],
            ]
        })
            .then(res => res.json())
            .then((data) => {
                this.setState({precons: data})
            })
            .catch(console.log);
    }

    private fetchBooster(precon: string) {
        this.setState({
            loading: true
        });
        fetch('/api/booster/generateBooster?deckName=' + precon, {
            headers: [
                ['Accept', 'application/json'],
            ]
        })
            .then(res => res.json())
            .then((data) => {
                this.setState({cards: data, loading: false})
            })
            .catch(console.log);
    }

    render() {
        const cards = this.state.cards.map((c) => {
            return (
                <Col xs={2} className="d-flex flex-column" key={c.faces[0].name}>
                    <img
                        src={'https://api.scryfall.com/cards/named?format=image&version=small&exact=' + c.faces[0].name}
                        alt={c.faces[0].name}/>
                </Col>
            );
        })
        const precons = Object.entries(this.state.precons).map(([p, card]) => {
            return <option key={p} value={p}>{card.faces[0].name} ({p})</option>
        })
        return (
            <Container className="col-10 offset-1">
                <div>
                    <select className="form-control" value={this.state.selectedPrecon} onChange={(event => {
                        this.setState({
                            selectedPrecon: event.target.value
                        });
                        if (event.target.value !== '') {
                            this.fetchBooster(event.target.value);
                        }
                    })}>
                        <option value=""/>
                        {precons}
                    </select>
                </div>

                {this.state.selectedPrecon !== '' && !this.state.loading ?
                    <button type="button" className="btn btn-primary"
                            onClick={() => this.fetchBooster(this.state.selectedPrecon)}>Regenerate</button> : <div/>}

                {this.state.loading ? (
                    <div>Loading</div>
                ) : (
                    <div>
                        <Row>{cards}</Row>
                    </div>
                )}
            </Container>
        );
    }

}

export default App;
