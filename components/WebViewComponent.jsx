import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { View, StatusBar, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome5 } from '@expo/vector-icons';
import { styles } from './styles';

const WebViewComponent = () => {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [isError, setIsError] = useState(false);

  const handleWebViewLoadStart = useCallback(() => {
    setLoading(true);
    setIsError(false);
  }, []);

  const handleWebViewLoadEnd = useCallback(() => {
    setLoading(false);
    webViewRef.current.injectJavaScript(injectedJavaScript);
  }, []);

  useEffect(() => {
    const checkInternetConnection = async () => {
      try {
        const response = await fetch('https://chat.openai.com/chat', { method: 'GET'});
        setIsConnected(response.ok);
        setIsError(!response.ok);
      } catch (error) {
        setIsConnected(false);
        setIsError(true);
      }
    };
    checkInternetConnection();
  }, []);

  const injectedJavaScript = useMemo(
    () => `
      const style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = \`
        button:focus { outline: none !important; box-shadow: none !important; }
        *:active { outline: none; -webkit-tap-highlight-color: transparent; }
      \`;
      document.getElementsByTagName('head')[0].appendChild(style);
    `,
    []
  );

  const webViewStyles = useMemo(
    () => ({
      backgroundColor: loading ? '#343541' : 'white',
    }),
    [loading]
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor="#343541" />
      {(isError || (!isConnected && !loading)) && (
        <View style={styles.errorContainer}>
          <FontAwesome5 style={styles.icon} name="exclamation-triangle" />
          <Text style={styles.errorText}>Unable to connect.</Text>
          <Text style={[styles.errorText, { marginTop: -5 }]}>Please check your internet connection, and try again later.</Text>
        </View>
      )}
      {isConnected && (
        <WebView
          ref={webViewRef}
          source={{ uri: 'https://chat.openai.com/chat' }}
          onLoadStart={handleWebViewLoadStart}
          onLoadEnd={handleWebViewLoadEnd}
          style={webViewStyles}
        />
      )}
    </View>
  );
};

export default WebViewComponent;