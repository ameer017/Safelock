"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Calendar,
  Plus,
  Minus,
  Settings,
  History
} from "lucide-react"

export default function Dashboard() {
  const [savingsGoal] = useState(10000)
  const [currentSavings] = useState(7500)
  const [monthlyTarget] = useState(1000)

  const progress = (currentSavings / savingsGoal) * 100

  return (
    <main className="flex-1 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Savings Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your savings and track your progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${currentSavings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(progress)}%</div>
              <Progress value={progress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${monthlyTarget.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                $750 remaining this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">APY</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2%</div>
              <p className="text-xs text-muted-foreground">
                +0.1% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Savings Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Savings Overview</CardTitle>
                <CardDescription>
                  Track your progress towards your financial goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Goal: ${savingsGoal.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">
                        ${(savingsGoal - currentSavings).toLocaleString()} remaining
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">+$500</div>
                      <div className="text-sm text-muted-foreground">This Month</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">$315</div>
                      <div className="text-sm text-muted-foreground">Interest Earned</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your savings account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Funds
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Minus className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <History className="mr-2 h-4 w-4" />
                  Transaction History
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-100 text-green-600">
                        <Plus className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Deposit</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                    <div className="text-sm font-medium text-green-600">+$500</div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <TrendingUp className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Interest Earned</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                    <div className="text-sm font-medium text-blue-600">+$15.30</div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        <Target className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Goal Update</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                    <div className="text-sm font-medium">75%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transaction History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View all your recent transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="deposits">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {[
                    { type: "deposit", amount: 500, date: "2024-01-15", status: "completed" },
                    { type: "interest", amount: 15.30, date: "2024-01-14", status: "completed" },
                    { type: "deposit", amount: 1000, date: "2024-01-10", status: "completed" },
                    { type: "withdrawal", amount: -200, date: "2024-01-08", status: "completed" },
                  ].map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={
                            transaction.type === "deposit" ? "bg-green-100 text-green-600" :
                            transaction.type === "withdrawal" ? "bg-red-100 text-red-600" :
                            "bg-blue-100 text-blue-600"
                          }>
                            {transaction.type === "deposit" ? <Plus className="h-4 w-4" /> :
                             transaction.type === "withdrawal" ? <Minus className="h-4 w-4" /> :
                             <TrendingUp className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium capitalize">{transaction.type}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.amount > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {transaction.amount > 0 ? "+" : ""}${transaction.amount.toLocaleString()}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
