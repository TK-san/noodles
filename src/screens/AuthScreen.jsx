import { useState } from 'react';
import {
  VStack,
  Heading,
  Text,
  Button,
  Container,
  Box,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  IconButton,
  useColorMode,
  useColorModeValue,
  useToast,
  Divider,
  HStack,
  InputGroup,
  InputRightElement,
  PinInput,
  PinInputField,
} from '@chakra-ui/react';
import { FiSun, FiMoon, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

export const AuthScreen = ({ onContinueOffline }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // OTP verification state
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { signIn, signUp, verifyOtp, resendOtp } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  const headingColor = useColorModeValue('brand.600', 'brand.400');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const dividerColor = useColorModeValue('gray.300', 'gray.600');

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login failed',
            description: error.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: 'Sign up failed',
            description: error.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Verification code sent!',
            description: 'Please check your email for the 6-digit code.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          setShowOtpInput(true);
        }
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter the 6-digit code from your email.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsVerifying(true);

    try {
      const { error } = await verifyOtp(email, otpCode, 'signup');
      if (error) {
        toast({
          title: 'Verification failed',
          description: error.message || 'Invalid or expired code. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setOtpCode('');
      } else {
        toast({
          title: 'Email verified!',
          description: 'Your account is now active. Welcome!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // User will be automatically logged in via auth state change
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      const { error } = await resendOtp(email);
      if (error) {
        toast({
          title: 'Failed to resend',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Code resent!',
          description: 'Please check your email for the new code.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackFromOtp = () => {
    setShowOtpInput(false);
    setOtpCode('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setConfirmPassword('');
  };

  // OTP Verification Screen
  if (showOtpInput) {
    return (
      <Container maxW="md" h="100vh" display="flex" alignItems="center" position="relative">
        {/* Theme toggle button */}
        <Box position="absolute" top={4} right={4}>
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            onClick={toggleColorMode}
            variant="ghost"
            size="lg"
            borderRadius="full"
          />
        </Box>

        {/* Back button */}
        <Box position="absolute" top={4} left={4}>
          <IconButton
            aria-label="Go back"
            icon={<FiArrowLeft size={20} />}
            onClick={handleBackFromOtp}
            variant="ghost"
            size="lg"
            borderRadius="full"
          />
        </Box>

        <VStack spacing={6} w="100%" textAlign="center">
          <Box fontSize="5xl">📧</Box>
          <Heading size="xl" color={headingColor}>
            Verify Your Email
          </Heading>
          <Text fontSize="md" color={textColor}>
            We sent a 6-digit code to
          </Text>
          <Text fontSize="md" fontWeight="bold" color={headingColor}>
            {email}
          </Text>

          <VStack spacing={4} w="100%" maxW="300px">
            <HStack justify="center">
              <PinInput
                size="lg"
                value={otpCode}
                onChange={setOtpCode}
                otp
                autoFocus
              >
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
              </PinInput>
            </HStack>

            <Button
              colorScheme="brand"
              size="lg"
              w="100%"
              onClick={handleVerifyOtp}
              isLoading={isVerifying}
              loadingText="Verifying..."
              isDisabled={otpCode.length !== 6}
            >
              Verify Email
            </Button>

            <HStack spacing={1} justify="center">
              <Text fontSize="sm" color={textColor}>
                Didn't receive the code?
              </Text>
              <Button
                variant="link"
                size="sm"
                color={headingColor}
                onClick={handleResendOtp}
                isLoading={isResending}
                loadingText="Sending..."
              >
                Resend
              </Button>
            </HStack>
          </VStack>

          <Text fontSize="xs" color={textColor} maxW="280px">
            Check your spam folder if you don't see the email
          </Text>
        </VStack>
      </Container>
    );
  }

  // Login/Signup Screen
  return (
    <Container maxW="md" h="100vh" display="flex" alignItems="center" position="relative">
      {/* Theme toggle button */}
      <Box position="absolute" top={4} right={4}>
        <IconButton
          aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
          icon={colorMode === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          onClick={toggleColorMode}
          variant="ghost"
          size="lg"
          borderRadius="full"
        />
      </Box>

      <VStack spacing={6} w="100%" textAlign="center">
        <Box fontSize="5xl">🍜</Box>
        <Heading size="xl" color={headingColor}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Heading>
        <Text fontSize="md" color={textColor}>
          {isLogin
            ? 'Sign in to sync your progress across devices'
            : 'Sign up to save your learning progress'}
        </Text>

        <Box as="form" onSubmit={handleSubmit} w="100%" maxW="300px">
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                size="lg"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    icon={showPassword ? <FiEyeOff /> : <FiEye />}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            {!isLogin && (
              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  size="lg"
                />
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              </FormControl>
            )}

            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              w="100%"
              isLoading={isLoading}
              loadingText={isLogin ? 'Signing in...' : 'Creating account...'}
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </VStack>
        </Box>

        <Button variant="link" onClick={toggleMode} color={headingColor}>
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </Button>

        <HStack w="100%" maxW="300px">
          <Divider borderColor={dividerColor} />
          <Text fontSize="sm" color={textColor} whiteSpace="nowrap" px={2}>
            or
          </Text>
          <Divider borderColor={dividerColor} />
        </HStack>

        <Button
          variant="outline"
          size="lg"
          w="100%"
          maxW="300px"
          onClick={onContinueOffline}
        >
          Continue without account
        </Button>

        <Text fontSize="xs" color={textColor} maxW="280px">
          Progress will be saved locally on this device only
        </Text>
      </VStack>
    </Container>
  );
};
