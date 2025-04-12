// src/components/SupressWarnings.tsx
'use client';

import React, { Component } from 'react';

interface Props {
  children: React.ReactNode;
}

// This is a component to suppress specific React warnings in development
class SuppressWarnings extends Component<Props> {
  componentDidMount() {
    // Save the original console.error
    const originalConsoleError = console.error;
    
    // Override console.error to filter out specific warnings
    console.error = (...args: any[]) => {
      if (args[0]?.includes && args[0].includes('UNSAFE_componentWillReceiveProps')) {
        return; // Suppress this specific warning
      }
      originalConsoleError(...args);
    };
  }

  render() {
    return this.props.children;
  }
}

export default SuppressWarnings;