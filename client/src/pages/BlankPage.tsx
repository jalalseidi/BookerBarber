
import { Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export function WelcomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader className="space-y-6">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
            <Scissors className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              BarberBooker
            </CardTitle>
            <div className="flex items-center justify-center gap-2">
              {/*<Sparkles className="h-4 w-4 text-primary" />*/}
              {/*<Sparkles className="h-4 w-4 text-primary" />*/}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-muted-foreground text-lg">
              Welcome to our premium barbershop!
            </p>
          </div>
          <Button 
            onClick={() => navigate("/login")} 
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >Enter
            {/*<ArrowRight className="ml-2 h-5 w-5" />*/}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
