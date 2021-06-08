import React, {Component} from 'react';
import './App.css';
import {Container, Row, Col} from "react-bootstrap";
import Select from 'react-select';

interface MagicCardFace {
    name: string;
}

interface MagicCard {
    faces: MagicCardFace[];
    eurPrice: number;
    usdPrice: number;
}

interface SelectOption {
    value: string;
    label: string;
}

interface AppState {
    cards: MagicCard[];
    precons: { [key: string]: MagicCard };
    selectedPrecon: SelectOption | null;
    loading: boolean;
}

class App extends Component<{}, AppState> {
    private selectPrecon = (selected: SelectOption | null) => {
        if (selected) {
            this.fetchBooster(selected.value);
        }
        this.setState({
            selectedPrecon: selected
        })
    };

    constructor(props: {}) {
        super(props);

        this.state = {
            cards: [],
            precons: {},
            selectedPrecon: null,
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
                    <CardImage card={c} size="small"/>
                </Col>
            );
        })
        const precons = Object.entries(this.state.precons).map(([p, card]) => {
            return {
                value: p,
                label: `${card.faces[0].name} (${p})`
            }
        })
        return (
            <Container className="col-10 offset-1">
                <div>
                    <Select options={precons} isSearchable={true} value={this.state.selectedPrecon} isMulti={false}
                            onChange={this.selectPrecon}/>
                </div>

                {this.state.selectedPrecon && !this.state.loading ?
                    <button type="button" className="btn btn-primary"
                            onClick={() => {
                                const value = this.state.selectedPrecon?.value;
                                if (value)
                                    this.fetchBooster(value);
                            }}>Regenerate</button> : <div/>}

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

function CardImage(props: { card: MagicCard, size: 'small' | 'normal' | 'large' | 'png' }) {
    return <img
        src={'https://api.scryfall.com/cards/named?format=image&version=' + props.size + '&exact=' + props.card.faces[0].name}
        alt={props.card.faces[0].name}/>
}

export default App;
