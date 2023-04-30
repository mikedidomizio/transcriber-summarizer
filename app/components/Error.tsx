import React from "react";

export const Error = ({ error }: { error: string }) => {
    return <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
            <div className="max-w-md">
                <h1 className="text-5xl font-bold">An Error Occurred :(</h1>
                <p className="py-6">
                    There's a few places I could fail.<br/> Here is what was reported <br/> "{error}"
                </p>
            </div>
        </div>
    </div>
}
