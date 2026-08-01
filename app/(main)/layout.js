import React from 'react'

const MainLayout = ({children}) => {

    //redirect to onboarding

  return (
    <div className="container mx-auto mt-24 mb-24 min-h-[calc(100vh-6rem)] overflow-visible px-4">
      {children}
    </div>
  )
}

export default MainLayout
