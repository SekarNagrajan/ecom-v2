import type { Meta, StoryObj } from '@storybook/react';
import { Button, Flex, Form, Input, Space, Typography } from 'antd';
import { useState } from 'react';

import { AppModal, AppDrawer, AppPopover } from '.';
import { DIALOG_SIZES } from './constants';

const { Title, Text, Paragraph } = Typography;

const meta: Meta = {
  title: 'Components/Dialog',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-6xl mx-auto p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

/* -------------------------------------------------------------------------- */
/* Modal Stories                                                              */
/* -------------------------------------------------------------------------- */

function ModalSizesDemo() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<keyof typeof DIALOG_SIZES>('md');

  const handleOpen = (s: keyof typeof DIALOG_SIZES) => {
    setSize(s);
    setOpen(true);
  };

  return (
    <div className="w-full space-y-4">
      <Title level={4}>Modal Sizes</Title>
      <Space wrap>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as (keyof typeof DIALOG_SIZES)[]).map(
          (s) => (
            <Button key={s} onClick={() => handleOpen(s)}>
              {s.toUpperCase()} ({DIALOG_SIZES[s]}px)
            </Button>
          )
        )}
      </Space>

      <AppModal
        open={open}
        title={`${size.toUpperCase()} Modal`}
        onCancel={() => setOpen(false)}
        dialogSize={size}
      >
        <Paragraph>
          This is a {size.toUpperCase()} modal with width of{' '}
          {DIALOG_SIZES[size]}px.
        </Paragraph>
        <Paragraph>
          Modal content goes here. You can put any content inside.
        </Paragraph>
      </AppModal>
    </div>
  );
}

export const ModalSizes: Story = {
  render: () => <ModalSizesDemo />,
};

function FullScreenModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full space-y-4">
      <Title level={4}>Full Screen Modal</Title>
      <Button onClick={() => setOpen(true)}>Open Full Screen</Button>

      <AppModal
        open={open}
        title="Full Screen Modal"
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
        dialogSize="fullscreen"
      >
        <Paragraph>
          This is a full screen modal that occupies the entire viewport.
        </Paragraph>
        <Paragraph>
          Useful for detailed content, forms, or complex interfaces.
        </Paragraph>
      </AppModal>
    </div>
  );
}

export const FullScreenModal: Story = {
  render: () => <FullScreenModalDemo />,
};

function ModalWithFormDemo() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      console.log('Form values:', values);
      setOpen(false);
    });
  };

  return (
    <div className="w-full space-y-4">
      <Title level={4}>Modal with Form</Title>
      <Button onClick={() => setOpen(true)}>Open Form Modal</Button>

      <AppModal
        open={open}
        title="Edit Profile"
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
        </Form>
      </AppModal>
    </div>
  );
}

export const ModalWithForm: Story = {
  render: () => <ModalWithFormDemo />,
};

/* -------------------------------------------------------------------------- */
/* Drawer Stories                                                             */
/* -------------------------------------------------------------------------- */

function DrawerPlacementsDemo() {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<
    'left' | 'right' | 'top' | 'bottom'
  >('right');

  return (
    <div className="w-full space-y-4">
      <Title level={4}>Drawer Placements</Title>
      <Space wrap>
        <Button
          onClick={() => {
            setPlacement('left');
            setOpen(true);
          }}
        >
          Left
        </Button>
        <Button
          onClick={() => {
            setPlacement('right');
            setOpen(true);
          }}
        >
          Right
        </Button>
        <Button
          onClick={() => {
            setPlacement('top');
            setOpen(true);
          }}
        >
          Top
        </Button>
        <Button
          onClick={() => {
            setPlacement('bottom');
            setOpen(true);
          }}
        >
          Bottom
        </Button>
      </Space>

      <AppDrawer
        open={open}
        placement={placement}
        onClose={() => setOpen(false)}
        title={`${
          placement.charAt(0).toUpperCase() + placement.slice(1)
        } Drawer`}
      >
        <Paragraph>
          This drawer slides from the {placement} side of the screen.
        </Paragraph>
        <Paragraph>
          Drawers are useful for side panels, settings, or quick actions.
        </Paragraph>
      </AppDrawer>
    </div>
  );
}

export const DrawerPlacements: Story = {
  render: () => <DrawerPlacementsDemo />,
};

function DrawerSizesDemo() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<keyof typeof DIALOG_SIZES>('md');

  const handleOpen = (s: keyof typeof DIALOG_SIZES) => {
    setSize(s);
    setOpen(true);
  };

  return (
    <div className="w-full space-y-4">
      <Title level={4}>Drawer Sizes</Title>
      <Space wrap>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as (keyof typeof DIALOG_SIZES)[]).map(
          (s) => (
            <Button key={s} onClick={() => handleOpen(s)}>
              {s.toUpperCase()} ({DIALOG_SIZES[s]}px)
            </Button>
          )
        )}
      </Space>

      <AppDrawer
        open={open}
        placement="right"
        onClose={() => setOpen(false)}
        title={`${size.toUpperCase()} Drawer`}
        dialogSize={size}
      >
        <Paragraph>
          This is a {size.toUpperCase()} drawer with width of{' '}
          {DIALOG_SIZES[size]}px.
        </Paragraph>
        <Paragraph>
          Drawer content goes here. You can put any content inside.
        </Paragraph>
      </AppDrawer>
    </div>
  );
}

export const DrawerSizes: Story = {
  render: () => <DrawerSizesDemo />,
};

function FullScreenDrawerDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full space-y-4">
      <Title level={4}>Full Screen Drawer</Title>
      <Button onClick={() => setOpen(true)}>Open Full Screen Drawer</Button>

      <AppDrawer
        open={open}
        placement="right"
        onClose={() => setOpen(false)}
        title="Full Screen Drawer"
        dialogSize="fullscreen"
        footer={
          <Flex justify="end">
            <Button>One</Button>
            <Button>Two</Button>
          </Flex>
        }
      >
        <Paragraph>
          This is a full screen drawer that occupies the entire viewport.
        </Paragraph>
        <Paragraph>
          Useful for detailed side content or complex interfaces.
        </Paragraph>
      </AppDrawer>
    </div>
  );
}

export const FullScreenDrawer: Story = {
  render: () => <FullScreenDrawerDemo />,
};

/* -------------------------------------------------------------------------- */
/* Popover Stories                                                            */
/* -------------------------------------------------------------------------- */

function PopoverSizesDemo() {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

  return (
    <div className="w-full space-y-4">
      <Title level={4}>Popover Sizes</Title>
      <Space wrap>
        {sizes.map((s) => (
          <AppPopover
            key={s}
            content={
              <div className="p-2">
                <Text strong>{s.toUpperCase()} Popover</Text>
                <Paragraph className="mb-0 mt-2">
                  Width: {DIALOG_SIZES[s]}px
                </Paragraph>
              </div>
            }
          >
            <Button>{s.toUpperCase()}</Button>
          </AppPopover>
        ))}
      </Space>
    </div>
  );
}

export const PopoverSizes: Story = {
  render: () => <PopoverSizesDemo />,
};

function PopoverWithFormDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full space-y-4">
      <Title level={4}>Popover with Form</Title>
      <AppPopover
        open={open}
        onOpenChange={setOpen}
        content={
          <Form layout="vertical" style={{ width: 200 }}>
            <Form.Item name="email" label="Email" className="mb-2">
              <Input placeholder="Enter email" size="small" />
            </Form.Item>
            <Form.Item name="password" label="Password" className="mb-2">
              <Input.Password placeholder="Enter password" size="small" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block size="small">
              Sign In
            </Button>
          </Form>
        }
        trigger="click"
      >
        <Button>Sign In</Button>
      </AppPopover>
    </div>
  );
}

export const PopoverWithForm: Story = {
  render: () => <PopoverWithFormDemo />,
};

function PopoverPlacementDemo() {
  const placements = ['top', 'bottom', 'left', 'right'] as const;

  return (
    <div className="w-full space-y-4">
      <Title level={4}>Popover Placements</Title>
      <div className="flex gap-8 items-center justify-center py-8">
        <div className="flex flex-col gap-4 items-center">
          {placements.map((placement) => (
            <AppPopover
              key={placement}
              placement={placement}
              content={
                <div className="p-2">
                  <Text>{placement} placement</Text>
                </div>
              }
            >
              <Button>{placement}</Button>
            </AppPopover>
          ))}
        </div>
      </div>
    </div>
  );
}

export const PopoverPlacement: Story = {
  render: () => <PopoverPlacementDemo />,
};

/* -------------------------------------------------------------------------- */
/* All Dialogs Overview                                                       */
/* -------------------------------------------------------------------------- */

function OverviewDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  return (
    <div className="w-full space-y-6">
      <Title level={4}>Dialog Components Overview</Title>
      <Text>A collection of dialog components for different use cases.</Text>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <Title level={5}>AppModal</Title>
          <Text className="block mb-4">
            Standard modal dialog that blocks interaction with the rest of the
            page.
          </Text>
          <Space>
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Button onClick={() => setFullscreenOpen(true)}>Full Screen</Button>
          </Space>
        </div>

        <div className="p-4 border rounded-lg">
          <Title level={5}>AppDrawer</Title>
          <Text className="block mb-4">
            Panel that slides in from the edge of the screen.
          </Text>
          <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
        </div>

        <div className="p-4 border rounded-lg">
          <Title level={5}>AppPopover</Title>
          <Text className="block mb-4">
            Small contextual overlay for quick actions or information.
          </Text>
          <AppPopover
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            content={
              <div className="p-2">
                <Text>This is a popover content</Text>
              </div>
            }
            trigger="click"
          >
            <Button>Open Popover</Button>
          </AppPopover>
        </div>

        <div className="p-4 border rounded-lg">
          <Title level={5}>Sizes</Title>
          <Text className="block mb-4">
            All dialogs support: xs (400px), sm (600px), md (800px), lg
            (1000px), xl (1200px)
          </Text>
          <Text type="secondary">Plus 'fullscreen' for Modal and Drawer</Text>
        </div>
      </div>

      <AppModal
        open={modalOpen}
        title="Modal Dialog"
        onCancel={() => setModalOpen(false)}
        onOk={() => setModalOpen(false)}
      >
        <Paragraph>
          This is a standard modal dialog. It blocks interaction with the parent
          page until closed.
        </Paragraph>
      </AppModal>

      <AppDrawer
        open={drawerOpen}
        placement="right"
        title="Drawer Panel"
        onClose={() => setDrawerOpen(false)}
      >
        <Paragraph>
          This is a drawer panel that slides in from the right side.
        </Paragraph>
        <Paragraph>
          Drawers are great for side navigation, settings panels, or quick
          forms.
        </Paragraph>
      </AppDrawer>

      <AppModal
        open={fullscreenOpen}
        title="Full Screen Modal"
        onCancel={() => setFullscreenOpen(false)}
        dialogSize="fullscreen"
      >
        <Paragraph>
          This modal occupies the entire viewport, useful for detailed content
          or complex interfaces.
        </Paragraph>
      </AppModal>
    </div>
  );
}

export const Overview: Story = {
  render: () => <OverviewDemo />,
};

/* -------------------------------------------------------------------------- */
/* Sizes Reference                                                            */
/* -------------------------------------------------------------------------- */

export const SizeReference: Story = {
  render: () => (
    <div className="w-full space-y-4">
      <Title level={4}>Size Reference</Title>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="border p-2">Size</th>
            <th className="border p-2">Width (px)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">xs</td>
            <td className="border p-2">400</td>
          </tr>
          <tr>
            <td className="border p-2">sm</td>
            <td className="border p-2">600</td>
          </tr>
          <tr>
            <td className="border p-2">md</td>
            <td className="border p-2">800</td>
          </tr>
          <tr>
            <td className="border p-2">lg</td>
            <td className="border p-2">1000</td>
          </tr>
          <tr>
            <td className="border p-2">xl</td>
            <td className="border p-2">1200</td>
          </tr>
          <tr>
            <td className="border p-2">fullscreen</td>
            <td className="border p-2">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
};
