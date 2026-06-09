import React from 'react'
import Header from '../components/Header'
import Body from '../components/Body'
import Footer from '../components/Footer'

const NeonFlow = () => {
    return (
            <div className="min-h-screen bg-linear-to-br from-purple-950 to-black flex flex-col px-10 py-3">
                <Header />
                <Body />
                <Footer />
            </div>
    )
}

export default NeonFlow