export const theme = {
    colors: {
        vibe: {
            dark: '#0F172A', // Slate 900
            darker: '#020617', // Slate 950
            card: '#FFFFFF',
            purple: '#A855F7', // Purple 500
            pink: '#EC4899', // Pink 500
            purpleLight: 'rgba(168, 85, 247, 0.2)', // 20% opacity
            pinkLight: 'rgba(236, 72, 153, 0.2)', // 20% opacity
        },
        white: '#FFFFFF',
        white5: 'rgba(255, 255, 255, 0.05)',
        white10: 'rgba(255, 255, 255, 0.1)',
        white50: 'rgba(255, 255, 255, 0.5)',
        slate900: '#0F172A',
        gray100: '#F3F4F6',
        purple50: '#FAF5FF',
    },
    gradients: {
        vibe: ['#7C3AED', '#DB2777'],
        hover: ['#6D28D9', '#BE185D'],
        overlay: ['rgba(250, 245, 255, 0.3)', 'transparent'],
    },
    shadows: {
        card: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 5,
        },
        // Adding extra glow shadow separately requires wrapping or handling in View style
    }
};
