-- Add SELECT policy for users to read platform_messages ONLY if they are a recipient
CREATE POLICY "Users can view messages they are recipients of" 
ON public.platform_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.message_recipients mr
    WHERE mr.message_id = platform_messages.id 
    AND mr.user_id = auth.uid()
  )
);