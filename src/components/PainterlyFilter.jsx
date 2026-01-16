export default function PainterlyFilter() {
    return (
        <svg width="0" height="0" className="absolute">
            <defs>
                <filter id="painterly">
                    {/* 1. Distort the edges to look like wet paint using Turbulence */}
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.015"
                        numOctaves="3"
                        result="noise"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="25"
                        xChannelSelector="R"
                        yChannelSelector="G"
                        result="distorted"
                    />

                    {/* 2. Add texture/canvas grain */}
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.8"
                        numOctaves="3"
                        result="grain"
                    />
                    <feColorMatrix
                        type="matrix"
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"
                        in="grain"
                        result="grainAdjusted"
                    />
                    <feBlend
                        mode="overlay"
                        in="grainAdjusted"
                        in2="distorted"
                        result="textured"
                    />

                    {/* 3. Enhance contrast to make it look like thick oil paint */}
                    <feComponentTransfer in="textured" result="highContrast">
                        <feFuncR type="linear" slope="1.2" intercept="-0.1" />
                        <feFuncG type="linear" slope="1.2" intercept="-0.1" />
                        <feFuncB type="linear" slope="1.2" intercept="-0.1" />
                    </feComponentTransfer>

                    {/* 4. Drop Shadow/Lighting for depth */}
                    <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
                    <feOffset dx="4" dy="4" result="offsetBlur" />
                    <feMerge>
                        <feMergeNode in="offsetBlur" />
                        <feMergeNode in="highContrast" />
                    </feMerge>
                </filter>
            </defs>
        </svg>
    );
}
