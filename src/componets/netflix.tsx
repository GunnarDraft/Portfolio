import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import React from 'react';
import styled from 'styled-components';
import Container from '@material-ui/core/Container';
import CardActions from '@material-ui/core/CardActions';
import Button from '@mui/material/Button';


const SvgSuscripcion = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="sc-fujyUd bNRxIN"
        color="#e50914"
        viewBox="0 0 600 600"
        {...props}
    >
        <path
            fill="#e50914"
            d="M329.9 324.7H451v24.9H329.9z"
            className="prefix__st0"
        />
        <path
            fill="#e50914"
            d="M329.9 359.1H451V384H329.9z"
            className="prefix__st1"
        />
        <path
            fill="#e50914"
            d="m130.4 148.3-28.2 28.2h395.6l-28.2-28.2zm0 254.4-28.2 28.2h395.6l-28.2-28.2z"
            className="prefix__st0"
        />
        <path
            fill="#e50914"
            d="M130.4 201.7 102.2 230h395.6l-28.2-28.3z"
            className="prefix__st1"
        />
        <path
            fill="#e50914"
            d="m468.1 283.9 28-28H103.9l28 28z"
            className="prefix__st0"
        />
        <path
            fill="#e50914"
            d="M469.6 148.3v282.6h28.2V176.5zm-339.2 0v241.2h-28.2V172.4z"
            className="prefix__st1"
        />
        <circle
            cx={179.2}
            cy={348.3}
            r={18.7}
            fill="#e50914"
            className="prefix__st1"
        />
    </svg>
)
const SvgGiftCard = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="sc-pNWxx dmJSEp"
        color="#e50914"
        viewBox="0 0 600 600"
        {...props}
    >
        <path
            fill="#e50914"
            d="m213.7 92.4 28.9 1.3-59.8 69.4 1-36z"
            className="prefix__st0"
        />
        <path
            fill="#e50914"
            d="m242.6 93.7 69.6 93.3-15 17.3-83.5-111.9zm-6.7 117c-3.4 0-6.7.2-10.1.4-2.3-.3-5.1-.8-8-.9l-35.1-47.1 1-36 62.3 83.5c-3.3-.1-6.7-.1-10.1.1z"
            className="prefix__st1"
        />
        <path
            fill="#e50914"
            d="m415.7 126.7 1.2 36-60.1-69.1 28.9-1.5z"
            className="prefix__st0"
        />
        <path
            fill="#e50914"
            d="M368.1 210.6h-14.4l62-83.9 1.2 36-35.1 47.5c-4.6-.1-9.1.4-13.7.4zm17.6-118.5-83.1 112.4-15-17.2 69.2-93.7z"
            className="prefix__st1"
        />
        <path
            fill="#e50914"
            d="m292.7 445.9 19.5 19.8V189.4l-19.5 19.7z"
            className="prefix__st1"
        />
        <path
            fill="#e50914"
            d="m166.5 183-22.7 28.3h317.3L438.5 183z"
            className="prefix__st0"
        />
        <path
            fill="#e50914"
            d="m140 261.2-27 28.3h378.5l-27.1-28.3z"
            className="prefix__st1"
        />
        <path
            fill="#e50914"
            d="M438.5 183v282.7h22.6V211.3zm-272 0v247.5h-22.7V207.8z"
            className="prefix__st1"
        />
        <path
            fill="#e50914"
            d="M265.9 466.7H141.4l24.9-25h294.8v24z"
            className="prefix__st0"
        />
    </svg>
)
const Navbar = styled.div`
    -webkit-box-pack: justify;
    justify-content: space-between;
    height: 100px;
    background-color: #000000;
    `
const Footer = styled.div`
justify-content: flex-end;
    background-color: #000000;
`
const Image = styled.img`
    height: 64px;
    width:auto;
`
const Content = styled.div`
    -webkit-box-pack: start;
    justify-content: flex-start;
    -webkit-box-align: stretch;
    align-items: stretch;
    display: flex;
    flex-flow: column;
    height: 100%;
    max-width: 1200px;
    align-self: center;
    padding: 36px 24px; 
    background-color: #fafafa;`

const Div = styled.div`
    transform:scale(0.3) !important; 
    transform-origin: top left; 
    border: 1px dashed yellow !important;
    background-color:#fafafa;  
    height: 720px;
    width: 1110px;
    display: flex;
    flex-flow: column;
    flex: 1;
`
const DivFlexRow = styled.div`
    display: flex;
    flex-flow: row;
`
const DivFlexColumn = styled.div`
    display: flex;
    flex-flow: column;
    `
const LinkButton = styled.button`
    flex:1%;
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;
    margin:8px !important;
`
const Title = styled.p`
    text-align: center;
    font-family: "Netflix" !important;
    font-weight: 700 !important;
    font-size: 40px !important;
    line-height: 2.6rem;
    text-transform: uppercase;
`
const Text = styled.p`
    font-weight: 600 !important;
    font-family: "Netflix" !important;
    font-size: 20px !important;
    text-transform: initial;
`
const Text2 = styled.p`
    font-weight: 600 !important;
    font-family: "Netflix" !important;
    font-size: 16px !important;
    text-transform: initial;
`
const Card = styled.button` 
`
const CardContent = styled.div`
`


const redirect = () => {
    window.open('https://netflix.ekomercio.com/selfinvoice/', '_ blank');
}
function Netflix() {

    return <Div>
        <Navbar>
            <Image src={'./Ekomercio_Logo.png'} alt='Ekomercio_Logo' />
            <Title>
                Bienvenido
            </Title>
            <Image src={'./Netflix_Logo.png'} alt='Netflix_Logo' />
        </Navbar>

        <Content >
            <Card>
                <CardContent>
                    <Title>
                        PORTAL AUTOFACTURA
                    </Title>
                    <DivFlexRow>
                        <LinkButton  >
                            <DivFlexColumn>
                                <SvgSuscripcion height={160} width={190} />
                                <Text>
                                    Suscripción
                                </Text>
                            </DivFlexColumn>
                        </LinkButton>
                        <LinkButton   >
                            <DivFlexColumn>
                                <SvgGiftCard height={160} width={190} />
                                <Text>
                                    Tarjeta de regalo
                                </Text>
                            </DivFlexColumn>
                        </LinkButton>
                    </DivFlexRow>
                </CardContent>
                <Text2>
                    La generación de facturas estará disponible máximo 30 días después de la fecha de renovación o compra.
                </Text2>
            </Card>
        </Content>

        <Footer>
            <Button style={{ color: '#fff' }}>Preguntas frecuentes</Button>
            <Button style={{ color: '#fff' }}>Aviso de privacidad Ekomercio</Button>
            <Button style={{ color: '#fff' }}>Aviso de privacidad Netflix</Button>
            <Button style={{ color: '#fff' }}>© Ekomercio 2023 v 1.0.10</Button>
        </Footer>

    </Div >
}

export default Netflix;