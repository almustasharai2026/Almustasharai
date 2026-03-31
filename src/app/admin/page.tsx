"use client";

import { useUser, useFirestore, useCollection } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Gavel, ShieldAlert, Tag, Activity, Settings, X
} from "lucide-react";
import { collection } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function MasterAdminPanel() {
  const { user, profile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("users");

  const logsQuery = useMemoFirebase(() => db ? collection(db, "analytics") : null, [db]);
  const { data: logs } = useCollection(logsQuery);

  if (user?.email !== "bishoysamy390@gmail.com") {
    return <div className="h-screen flex items-center justify-center font-black">Sovereign Lock Active</div>;
  }

  return (
    <div className="min-h-screen p-6 lg:p-10" dir="rtl">
      <Card className="glass-cosmic border-none rounded-[2rem] overflow-hidden shadow-2xl bg-white dark:bg-slate-900">
        <header className="p-6 top-bar-gradient text-white flex items-center justify-between">
          <h1 className="text-2xl font-black flex items-center gap-3">
            <Settings className="h-6 w-6" /> لوحة التحكم السيادية
          </h1>
        </header>

        <Tabs defaultValue="users" className="p-6" onValueChange={setActiveTab}>
          <TabsList className="bg-slate-100 dark:bg-white/5 p-1 rounded-xl h-auto flex flex-wrap gap-1 mb-8">
            <TabTrigger value="users" label="المستخدمون" icon={<Users className="h-4 w-4" />} />
            <TabTrigger value="advisors" label="المستشارون" icon={<Gavel className="h-4 w-4" />} />
            <TabTrigger value="banned" label="الكلمات المحظورة" icon={<ShieldAlert className="h-4 w-4" />} />
            <TabTrigger value="offers" label="العروض" icon={<Tag className="h-4 w-4" />} />
            <TabTrigger value="logs" label="سجل الأحداث" icon={<Activity className="h-4 w-4" />} />
          </TabsList>

          <div className="space-y-6">
            <TabsContent value="users">
              <div className="flex gap-2">
                <Button className="admin-btn btn-green-gradient border-none">إضافة مستخدم</Button>
                <Button className="admin-btn btn-green-gradient border-none">حذف مستخدم</Button>
                <Button className="admin-btn btn-green-gradient border-none">حظر / فك حظر</Button>
              </div>
            </TabsContent>

            <TabsContent value="advisors">
              <div className="flex gap-2">
                <Button className="admin-btn btn-green-gradient border-none">إضافة مستشار</Button>
                <Button className="admin-btn btn-green-gradient border-none">حذف مستشار</Button>
                <Button className="admin-btn btn-green-gradient border-none">تعديل صلاحيات</Button>
              </div>
            </TabsContent>

            <TabsContent value="banned">
              <div className="flex gap-2">
                <Button className="admin-btn btn-green-gradient border-none">إضافة كلمة</Button>
                <Button className="admin-btn btn-green-gradient border-none">حذف كلمة</Button>
              </div>
            </TabsContent>

            <TabsContent value="offers">
              <div className="flex gap-2">
                <Button className="admin-btn btn-green-gradient border-none">إضافة عرض</Button>
                <Button className="admin-btn btn-green-gradient border-none">حذف عرض</Button>
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <div className="log-box max-h-[300px] overflow-y-auto bg-slate-100 dark:bg-black/40 p-4 rounded-xl font-mono text-[10px]">
                {logs?.map((log, i) => (
                  <div key={i} className="mb-2 opacity-70">
                    <span className="text-primary font-bold">[{new Date(log.createdAt?.seconds * 1000).toLocaleTimeString()}]</span> {log.event}: {JSON.stringify(log.data)}
                  </div>
                ))}
                {(!logs || logs.length === 0) && <p className="text-center opacity-30">لا يوجد سجلات حالية</p>}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}

function TabTrigger({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger 
      value={value} 
      className="flex-1 rounded-lg px-4 py-2.5 text-xs font-bold data-[state=active]:top-bar-gradient data-[state=active]:text-white transition-all gap-2"
    >
      {icon} {label}
    </TabsTrigger>
  );
}