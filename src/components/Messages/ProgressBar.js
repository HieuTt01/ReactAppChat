import React from  'react';
import { Progress } from 'semantic-ui-react';


const ProgressBar = ({ uploadState, percentUploaded }) => (
    uploadState ==="uploading" && (
        <Progress 
            inverted
            className="progress__bar"
            percent={percentUploaded}
            progress
            indicating
            size="medium"
        />
    )
);

export default ProgressBar;