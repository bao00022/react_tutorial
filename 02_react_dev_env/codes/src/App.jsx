import React from "react";

export default function App(props) {
    
    console.log(props);

    return <div>
        <h1>Hello React + Babel + webpack + webpack-dev-server!</h1>
        <p>This is a React development environment setup example.</p>
        <p>Welcome, { props.name }!</p>
    </div>;
}
