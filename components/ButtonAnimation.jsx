'use client'
import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Image from 'next/image'
import toast from 'react-hot-toast'

const ButtonAnimation = ({ onAddToCart, item, disabled = false }) => {
    const buttonRef = useRef(null)
    const timelineRef = useRef(null)
    const isAnimating = useRef(false) // Prevent multiple clicks

    useGSAP(() => {
        timelineRef.current = gsap.timeline({
            paused: true,
            onComplete: () => {
                // Animation finished
                isAnimating.current = false
            }
        })

        // Step 1: Hide "Add to Cart"
        .to('.step1', {
            opacity: 0,
            scale: 0,
            duration: 0.4,
            ease: "back.in(1.7)"
        })

        // Step 2: Tray enters
        .fromTo('.step-2',
            { opacity: 0, scale: 0.2, y: 100 },
            { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "power3.out" }
        )

        // Step 3: Food drops into tray
        .fromTo('.step-3 div',
            { opacity: 0, y: -150, scale: 0 },
            { opacity: 1, y: 0, scale: 1, duration: 1, ease: "bounce.out", stagger: 0.3 },
            "-=0.3"
        )

        // Step 4: Tray slides away with food
        .to(['.step-2', '.step-3'], {
            x: 200,
            opacity: 0,
            duration: 1.5,
            ease: "power2.inOut",
            delay: 0.3
        })

        // Step 5: Success message
        .fromTo('.step-4',
            { opacity: 0, scale: 0.5 },
            { opacity: 1, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.5)" }
        )
        .call(() => {
            showToast()
            // Call parent's addToCart function safely
            if (onAddToCart && item) onAddToCart(item)
        })
        .to('.step-4', {
            opacity: 0,
            y: -30,
            duration: 0.5,
            ease: "power1.in"
        }, "+=0.5") // wait 0.5s before hiding

        // Step 6: Bring back "Add To Cart" from top with bounce
        .to('.step1',
           
            { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
        )
    }, { scope: buttonRef })

    const showToast = () => {
        if (item) {
            toast.success(`${item.name} added to cart! 🛒`, {
                icon: '✅',
                style: {
                    background: '#FF7017',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                },
                duration: 3000,
            })
        }
    }

    const handleClick = () => {
        if (disabled || !item || isAnimating.current) return

        isAnimating.current = true
        timelineRef.current.restart()
    }

    const handleTouchStart = (e) => {
        e.preventDefault()
        handleClick()
    }

    return (
        <div ref={buttonRef}>
            <button
                onClick={handleClick}
                onTouchStart={handleTouchStart}
                disabled={disabled || !item || isAnimating.current}
                className='bg-[#FF7017] px-4 font-bold rounded-2xl text-white py-2 relative overflow-hidden w-full h-12 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed'
            >
                {/* Step 1: Idle */}
                <div className='step1'>Add To Cart</div>

                {/* Step 2: Tray */}
                <div className='step-2 absolute top-[80%] inset-0 flex items-center justify-center'>
                    <Image width={274} height={274} src={'/plate.png'} alt="plate"
                        className='w-[290px] h-[290px] scale-[1.3] object-contain' />
                </div>

                {/* Step 3: Food */}
                <div className="step-3 absolute inset-0 flex items-center justify-center">
                    <div className="relative w-[140px] h-[140px]">
                        <div className="absolute top-9 -rotate-6 left-2">
                            <Image width={64} height={64} src="/Fries.png" alt="fries" />
                        </div>
                        <div className="absolute top-9 left-1/2 -translate-x-1/2">
                            <Image width={124} height={124} src="/Burger.png" alt="burger" />
                        </div>
                        <div className="absolute top-9 rotate-6 right-2">
                            <Image width={64} height={64} src="/drink.png" alt="drink" />
                        </div>
                    </div>
                </div>

                {/* Step 4: Success */}
                <div className='step-4 absolute inset-0 flex items-center justify-center text-lg font-bold'>
                    ✅ Success
                </div>
            </button>
        </div>
    )
}

export default ButtonAnimation
