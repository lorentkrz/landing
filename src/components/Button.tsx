import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getContainerStyle = () => {
    let containerStyle: ViewStyle = { ...styles.container };

    // Variant styles
    if (variant === 'primary') {
      containerStyle = { ...containerStyle, ...styles.primaryContainer };
    } else if (variant === 'secondary') {
      containerStyle = { ...containerStyle, ...styles.secondaryContainer };
    } else if (variant === 'outline') {
      containerStyle = { ...containerStyle, ...styles.outlineContainer };
    } else if (variant === 'ghost') {
      containerStyle = { ...containerStyle, ...styles.ghostContainer };
    }

    // Size styles
    if (size === 'small') {
      containerStyle = { ...containerStyle, ...styles.smallContainer };
    } else if (size === 'large') {
      containerStyle = { ...containerStyle, ...styles.largeContainer };
    }

    // Full width
    if (fullWidth) {
      containerStyle = { ...containerStyle, ...styles.fullWidth };
    }

    // Disabled state
    if (disabled || loading) {
      containerStyle = {
        ...containerStyle,
        opacity: 0.6,
      };
    }

    return containerStyle;
  };

  const getTextStyle = () => {
    let textStyleObj: TextStyle = { ...styles.text };

    // Variant text styles
    if (variant === 'primary') {
      textStyleObj = { ...textStyleObj, ...styles.primaryText };
    } else if (variant === 'secondary') {
      textStyleObj = { ...textStyleObj, ...styles.secondaryText };
    } else if (variant === 'outline') {
      textStyleObj = { ...textStyleObj, ...styles.outlineText };
    } else if (variant === 'ghost') {
      textStyleObj = { ...textStyleObj, ...styles.ghostText };
    }

    // Size text styles
    if (size === 'small') {
      textStyleObj = { ...textStyleObj, ...styles.smallText };
    } else if (size === 'large') {
      textStyleObj = { ...textStyleObj, ...styles.largeText };
    }

    return textStyleObj;
  };

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const iconColor = variant === 'primary' || variant === 'secondary' ? '#fff' : '#4dabf7';

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'secondary' ? '#fff' : '#4dabf7'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon as any}
              size={iconSize}
              color={iconColor}
              style={styles.leftIcon}
            />
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon as any}
              size={iconSize}
              color={iconColor}
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primaryContainer: {
    backgroundColor: '#4dabf7',
  },
  secondaryContainer: {
    backgroundColor: '#1a1f2c',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4dabf7',
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  smallContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  largeContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#fff',
  },
  outlineText: {
    color: '#4dabf7',
  },
  ghostText: {
    color: '#4dabf7',
  },
  smallText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default Button;
