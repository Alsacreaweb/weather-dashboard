import './App.css';
import React, { Suspense } from 'react';
import Weather from './Weather';
import SkeletonLoader from './SkeletonLoader';

function App() {
    return (
        <Suspense fallback={<SkeletonLoader />}>
            <Weather />
        </Suspense>
    );
}

export default App;
