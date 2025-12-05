import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/useToast"
import {
  LogIn,
  User,
  Scissors,
  ArrowLeft,
  Mail,
  Lock
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

type LoginForm = {
  email: string
  password: string
}

type UserRole = "customer" | "barber"

export function AuthLogin() {
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer")
  const { toast } = useToast()
  const { login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true)
      // Add role to login data
      await login(data.email, data.password, selectedRole);
      toast({
        title: "Success",
        description: "Logged in successfully",
      })
      
      // Navigate based on role
      if (selectedRole === "customer") {
        navigate("/customer/dashboard")
      } else {
        navigate("/barber/dashboard")
      }
    } catch (error) {
      const err = error as Error;
      console.error("Login error:", err.message)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to Landing */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Scissors className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">StyleCraft</h1>
          </div>
          <p className="text-muted-foreground">Welcome back! Please sign in to continue.</p>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Choose your account type and enter your credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer
                </TabsTrigger>
                <TabsTrigger value="barber" className="flex items-center gap-2">
                  <Scissors className="h-4 w-4" />
                  Barber
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="mt-4">
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900/50">
                  <User className="h-4 w-4" />
                  <AlertDescription>
                    Sign in as a customer to book appointments and manage your bookings.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="barber" className="mt-4">
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900/50">
                  <Scissors className="h-4 w-4" />
                  <AlertDescription>
                    Sign in as a barber to manage your availability and view customer appointments.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...register("email", { required: true })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    {...register("password", { required: true })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In as {selectedRole === "customer" ? "Customer" : "Barber"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="link"
              className="text-sm text-muted-foreground"
              onClick={() => navigate("/auth/register")}
            >
              Don't have an account? Sign up
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
