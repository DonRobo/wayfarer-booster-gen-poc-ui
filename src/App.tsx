import React, {Component, useState} from 'react';
import './App.css';
import {Container, Row, Col} from "react-bootstrap";
import Select from 'react-select';
import axios from "axios";

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

    boosterConfig:any;
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
            loading: false,
            boosterConfig:{},
        }
    }

    componentDidMount() {
        axios.get('/api/precons/withCommander', {
            headers: {
                'Accept': 'application/json'
            }
        }).then(({data}) => {
            this.setState({precons: data})
        }).catch(console.log);
    }

    private fetchBooster(precon: string) {
        this.setState({
            loading: true
        });
        axios.get('/api/booster/generateBooster', {
            headers: {
                'Accept': 'application/json'
            }, params: {
                deckName: precon,
                useEuro: true,
            }
        })
            .then(({data}) => {
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
                    {/*<RequestOptions/>*/}
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

const RequestOptions = () => {
    const [inputValues, setInputValues] = useState<{ [x: string]: string }>({})

    const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const {name, value} = e.currentTarget
        setInputValues(prevState => ({...prevState, [name]: value}))
    }

    return (
        <div>
            <Row>
                <Col xs={1}>Budget</Col>
                <input className="col-2" name="budget" type="text" value={inputValues.budget ? inputValues.budget : ''}
                       onChange={handleInputChange}/>
            </Row>
            <Row>
                <Col xs={1}>Randomness</Col>
                <input className="col-2" name="randomness" type="text"
                       value={inputValues.randomness ? inputValues.randomness : ''}
                       onChange={handleInputChange}/>
            </Row>
        </div>
    );
}

export default App;
