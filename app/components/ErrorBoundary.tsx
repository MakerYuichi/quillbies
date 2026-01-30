import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isKeepAwakeError?: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorMessage = error?.message || '';
    const isKeepAwakeError = errorMessage.includes('keep awake') || 
                            errorMessage.includes('KeepAwake') ||
                            errorMessage.includes('Unable to activate keep awake');
    
    return { 
      hasError: true, 
      error,
      isKeepAwakeError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    
    // Handle keep awake errors specifically
    const errorMessage = error?.message || '';
    if (errorMessage.includes('keep awake') || 
        errorMessage.includes('KeepAwake') ||
        errorMessage.includes('Unable to activate keep awake')) {
      console.warn('[ErrorBoundary] Keep awake error caught, auto-recovering...');
      
      // Auto-recover from keep awake errors after 1 second
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined, isKeepAwakeError: false });
      }, 1000);
      return;
    }
    
    // Auto-recover from other errors after 2 seconds
    setTimeout(() => {
      this.setState({ hasError: false, error: undefined, isKeepAwakeError: false });
    }, 2000);
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isKeepAwakeError) {
        // Show minimal loading for keep awake errors
        return (
          <View style={styles.container}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        );
      }
      
      // Show minimal loading for other errors
      return (
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
});