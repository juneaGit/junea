'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormDrawer, Textarea } from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';

import {
  useCreateComment,
  createCommentInputSchema,
} from '../api/create-comment';

type CreateCommentProps = {
  discussionId: string;
};

export const CreateComment = ({ discussionId }: CreateCommentProps) => {
  const { addNotification } = useNotifications();
  const createCommentMutation = useCreateComment({
    discussionId,
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Comment Created',
        });
      },
    },
  });

  return (
    <FormDrawer
      isDone={createCommentMutation.isSuccess}
      triggerButton={
        <Button size="sm" icon={<Plus className="size-4" />}>
          Create Comment
        </Button>
      }
      title="Create Comment"
      submitButton={
        <Button
          isLoading={createCommentMutation.isPending}
          form="create-comment"
          type="submit"
          size="sm"
          disabled={createCommentMutation.isPending}
        >
          Submit
        </Button>
      }
    >
      <Form
        id="create-comment"
        onSubmit={(values) => {
          createCommentMutation.mutate({
            data: values,
          });
        }}
        schema={createCommentInputSchema}
        options={{
          defaultValues: {
            body: '',
            discussionId: discussionId,
          },
        }}
      >
        {({ register, formState }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <Textarea
              {...register('body')}
            />
            {formState.errors['body'] && (
              <p className="mt-1 text-sm text-red-600">{formState.errors['body']?.message}</p>
            )}
          </div>
        )}
      </Form>
    </FormDrawer>
  );
};
