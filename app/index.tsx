import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Modal, ScrollView } from 'react-native';
import { Menu, MoreVertical } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { INITIAL_DECK, buildDeckFromQuestions, generateCardVisuals, getAvailableQuestionCategories } from '../constants';
import { CardData, CardState } from '../types';
import { Card } from '../components/Card';
import { theme } from '../theme';

export default function App() {
    const availableCategories = useMemo(() => getAvailableQuestionCategories(), []);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(availableCategories);
    const [categoryModalOpen, setCategoryModalOpen] = useState(true);

    const [deck, setDeck] = useState<CardData[]>(INITIAL_DECK);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visuals, setVisuals] = useState<CardState[]>([]);

    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [isExiting, setIsExiting] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const initialDeck = buildDeckFromQuestions({ categories: availableCategories, themes: ['general'] });
        setDeck(initialDeck);
        setVisuals(generateCardVisuals(Math.max(200, initialDeck.length)));
    }, [availableCategories]);

    const applyCategorySelection = useCallback(() => {
        const nextDeck = buildDeckFromQuestions({ categories: selectedCategories, themes: ['general'] });
        setDeck(nextDeck);
        setCurrentIndex(0);
        setDirection('forward');
        setIsExiting(false);
        setIsAnimating(false);
        setVisuals(generateCardVisuals(Math.max(200, nextDeck.length)));
    }, [selectedCategories]);

    const handleNext = useCallback(() => {
        if (currentIndex >= deck.length - 1 || isAnimating) return;
        setDirection('forward');
        setCurrentIndex(prev => prev + 1);
    }, [currentIndex, deck.length, isAnimating]);

    const handlePrev = useCallback(() => {
        if (currentIndex <= 0 || isAnimating) return;
        setDirection('backward');
        setIsExiting(true);
        setIsAnimating(true);

        setTimeout(() => {
            setCurrentIndex(prev => prev - 1);
            setIsExiting(false);
            setIsAnimating(false);
        }, 350);
    }, [currentIndex, isAnimating]);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-20, 20]) // Only trigger horizontal
        .onEnd((e) => {
            const { translationX } = e;
            if (Math.abs(translationX) > 50) {
                if (translationX < 0) {
                    runOnJS(handleNext)();
                } else {
                    runOnJS(handlePrev)();
                }
            }
        });

    const visibleStackDepth = 20;
    const cardsToRender = useMemo(() => {
        const renderList = [];
        const startRenderIndex = Math.max(0, currentIndex - visibleStackDepth);

        for (let i = startRenderIndex; i <= currentIndex; i++) {
            const visualState = visuals[i % visuals.length] || { rotation: 0, offsetX: 0, offsetY: 0 };
            const isActive = i === currentIndex;
            const shouldAnimateIn = isActive && direction === 'forward' && !isExiting;

            renderList.push(
                <Card
                    key={deck[i].id}
                    data={deck[i]}
                    state={visualState}
                    index={i}
                    isActive={isActive}
                    isExiting={i === currentIndex && isExiting}
                    animateIn={shouldAnimateIn}
                />
            );
        }
        return renderList;
    }, [deck, currentIndex, visuals, isExiting, direction]);

    const currentLevel = deck[currentIndex]?.level || 1;
    const levelName = currentLevel === 1 ? 'VIBE CHECK' : currentLevel === 2 ? 'REAL TALK' : 'DEEP DIVE';

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                {/* Background Decor */}
                <View style={styles.blobTop} />
                <View style={styles.blobBottom} />

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => setCategoryModalOpen(true)}>
                            <Menu color="white" size={24} />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.logoText}>VIBE CHECK</Text>
                            <Text style={styles.subLogoText}>The Game</Text>
                        </View>
                    </View>

                    <View style={styles.headerRight}>
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelBadgeText}>LEVEL {currentLevel}</Text>
                        </View>

                        <TouchableOpacity style={styles.iconButton}>
                            <MoreVertical color="white" size={24} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.mainContainer}>
                    <GestureDetector gesture={panGesture}>
                        <View style={styles.cardStackWrapper}>
                            {cardsToRender}
                        </View>
                    </GestureDetector>
                </View>

                {/* Footer */}
                <View style={styles.footerInfo}>
                    <Text style={styles.mobileHintText}>SWIPE LEFT / RIGHT</Text>
                    <View style={{ height: 16 }} />
                    <Text style={styles.footerText}>
                        <Text style={{ color: theme.colors.vibe.purple }}>{levelName}</Text> • {currentIndex + 1} / {deck.length}
                    </Text>
                </View>

                <Modal
                    visible={categoryModalOpen}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setCategoryModalOpen(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>CHOOSE CATEGORIES</Text>
                            <Text style={styles.modalSubtitle}>Pick one or more to build your deck.</Text>

                            <ScrollView contentContainerStyle={styles.categoryGrid} showsVerticalScrollIndicator={false}>
                                {availableCategories.map((cat) => {
                                    const selected = selectedCategories.includes(cat);
                                    return (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[styles.categoryChip, selected ? styles.categoryChipSelected : styles.categoryChipUnselected]}
                                            onPress={() => {
                                                setSelectedCategories((prev) => {
                                                    const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat];
                                                    return next.length ? next : prev;
                                                });
                                            }}
                                        >
                                            <Text style={[styles.categoryChipText, selected ? styles.categoryChipTextSelected : styles.categoryChipTextUnselected]}>
                                                {cat.replace(/_/g, ' ').toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalButtonSecondary]}
                                    onPress={() => {
                                        setSelectedCategories(availableCategories);
                                    }}
                                >
                                    <Text style={styles.modalButtonSecondaryText}>SELECT ALL</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.modalButtonPrimary]}
                                    onPress={() => {
                                        applyCategorySelection();
                                        setCategoryModalOpen(false);
                                    }}
                                >
                                    <Text style={styles.modalButtonPrimaryText}>START</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.vibe.dark,
    },
    blobTop: {
        position: 'absolute',
        top: -150,
        left: -100,
        width: 600,
        height: 600,
        borderRadius: 300,
        backgroundColor: 'rgba(168, 85, 247, 0.1)', // Vibe purple
        transform: [{ scale: 1.5 }],
    },
    blobBottom: {
        position: 'absolute',
        bottom: -150,
        right: -100,
        width: 600,
        height: 600,
        borderRadius: 300,
        backgroundColor: 'rgba(236, 72, 153, 0.08)', // Vibe pink
        transform: [{ scale: 1.5 }],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        zIndex: 50,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    subLogoText: {
        color: theme.colors.vibe.purple,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    iconButton: {
        padding: 8,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 30,
        overflow: 'hidden',
    },
    disabledButton: {
        opacity: 0.7,
    },
    generateButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    levelBadge: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 30,
    },
    levelBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    mainContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 24, // Matches header padding
        paddingBottom: 100, // Push visual center upwards
    },
    navButton: {
        display: 'none',
    },
    cardStackWrapper: {
        width: '100%',
        maxWidth: 600,
        aspectRatio: 1.35, // Less squarish, more standard landscape card shape
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerInfo: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        alignItems: 'center',
    },
    mobileHintText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    footerText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(2, 6, 23, 0.75)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        maxWidth: 560,
        backgroundColor: theme.colors.vibe.darker,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        padding: 20,
    },
    modalTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    modalSubtitle: {
        marginTop: 6,
        color: 'rgba(255,255,255,0.65)',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    categoryGrid: {
        paddingTop: 16,
        paddingBottom: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
    },
    categoryChipSelected: {
        borderColor: theme.colors.vibe.purple,
        backgroundColor: 'rgba(168, 85, 247, 0.16)',
    },
    categoryChipUnselected: {
        borderColor: 'rgba(255,255,255,0.18)',
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    categoryChipText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    categoryChipTextSelected: {
        color: 'white',
    },
    categoryChipTextUnselected: {
        color: 'rgba(255,255,255,0.75)',
    },
    modalActions: {
        marginTop: 14,
        flexDirection: 'row',
        gap: 10,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonSecondary: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    modalButtonPrimary: {
        backgroundColor: theme.colors.vibe.purple,
    },
    modalButtonSecondaryText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    modalButtonPrimaryText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    mobileHint: {
        display: 'none', // Validate if User wants this hidden as desktop view implies it
    },
    hintText: {
        display: 'none',
    }
});
