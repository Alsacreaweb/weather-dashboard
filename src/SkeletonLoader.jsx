import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonLoader = () => {
    return (
        <div className="grid grid-cols-5 grid-rows-[auto,auto,1fr] gap-3 h-screen w-screen p-3 bg-slate-100">
            <div className="bg-white p-2 col-span-5 gap-3 flex flex-col lg:flex-row justify-between items-center rounded-lg">
                <Skeleton width={100} height={30} />
                <div className="relative w-4/5">
                    <Skeleton height={35} />
                </div>
            </div>
            {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-white p-2 h-auto flex flex-row justify-around items-center rounded-lg">
                    <Skeleton circle={true} height={80} width={80} />
                    <div>
                        <Skeleton width={100} height={20} />
                        <Skeleton width={80} height={20} />
                        <Skeleton width={120} height={20} />
                        <Skeleton width={100} height={20} />
                        <Skeleton width={90} height={20} />
                        <Skeleton width={110} height={20} />
                        <Skeleton width={70} height={20} />
                    </div>
                </div>
            ))}
            <div className="bg-white p-2 col-span-5 flex-grow rounded-xl">
                <Skeleton height={50} />
            </div>
        </div>
    );
};

export default SkeletonLoader;
