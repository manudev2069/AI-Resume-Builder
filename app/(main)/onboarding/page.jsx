// "use client";

import { getUserOnboardingStatus } from '@/actions/user'
import { industries } from '@/data/industries'
import React from 'react'
import OnboardingForm from './_components/onboarding-form';


const OnboardingPage =async () => {

    const {isOnboarded}  = await getUserOnboardingStatus();

  return (
    <main>
        <OnboardingForm industries={industries} isOnboarded={isOnboarded}/>
    </main>
  )
}

export default OnboardingPage
