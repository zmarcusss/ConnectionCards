import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { CardData, CardState } from '../types';
import { theme } from '../theme';

interface CardProps {
    data: CardData;
    state: CardState;
    index: number;
    isActive: boolean;
    isExiting: boolean;
    animateIn: boolean;
}

export const Card: React.FC<CardProps> = ({
    data,
    state: visualState,
    index,
    isActive,
    isExiting,
    animateIn
}) => {
    const animOpacity = useSharedValue(animateIn ? 0 : 1);
    const animY = useSharedValue(animateIn ? -80 : 0);
    const animScale = useSharedValue(animateIn ? 1.05 : 1);

    useEffect(() => {
        if (isExiting) {
            // Lift out animation
            animY.value = withTiming(-80, { duration: 300, easing: Easing.bezier(0.5, 0, 0.4, 1) });
            animOpacity.value = withTiming(0, { duration: 300 });
            animScale.value = withTiming(1.05, { duration: 300 });
        } else if (animateIn) {
            // Drop in animation
            animY.value = -80;
            animOpacity.value = 0;
            animScale.value = 1.05;

            animY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
            animOpacity.value = withTiming(1, { duration: 500 });
            animScale.value = withTiming(1, { duration: 500 });
        } else {
            // Reset
            animY.value = withTiming(0);
            animOpacity.value = withTiming(1);
            animScale.value = withTiming(1);
        }
    }, [isActive, isExiting, animateIn, animOpacity, animScale, animY]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: animOpacity.value,
            transform: [
                { translateX: visualState.offsetX },
                { translateY: visualState.offsetY + animY.value },
                { rotate: `${visualState.rotation}deg` },
                { scale: animScale.value }
            ],
            zIndex: index,
        };
    });

    return (
        <Animated.View style={[styles.cardContainer, animatedStyle]}>
            <View style={[styles.card, styles.shadow]}>
                <View style={styles.contentContainer}>
                    <Text style={styles.cardText} numberOfLines={6} adjustsFontSizeToFit>
                        {data.text}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>{data.footerText || "VIBE CHECK"}</Text>
                </View>

                <LinearGradient
                    colors={['rgba(250, 245, 255, 0.3)', 'transparent']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        position: 'absolute',
        width: '100%',
        aspectRatio: 1.35, // Match index.tsx
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.vibe.card,
        borderRadius: 24,
        padding: 32,
        justifyContent: 'space-between',
        overflow: 'hidden',
        borderWidth: 2, // Thicker border
        borderColor: '#CBD5E1', // Slate 300 - clearly visible grey
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 0,
    },
    cardText: {
        fontSize: 36, // Huge text
        fontWeight: '800',
        textAlign: 'center',
        color: '#0F172A',
        textTransform: 'uppercase',
        letterSpacing: -1,
    },
    footer: {
        width: '100%',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray100,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        color: theme.colors.vibe.purple,
        textTransform: 'uppercase',
    }
});
