"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SuccessStepProps {
    message: string;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ message }) => {
    return (
        <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold text-green-400">
                Onboarding Complete!
            </h3>
            <p className="text-gray-400">{message}</p>
            <Link href="/login">
                <Button>Proceed to Login</Button>
            </Link>
        </div>
    );
};
