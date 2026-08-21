import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Meta, StoryObj } from '@storybook/react';
import { Typography, Card, Button } from 'antd';
import { useState } from 'react';

import { AppTabs } from './app-tabs';
import type { TabItem } from './types';

const { Title, Text } = Typography;

const meta: Meta<typeof AppTabs> = {
  title: 'Components/AppTabs',
  component: AppTabs,
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
  argTypes: {
    type: {
      control: 'select',
      options: ['line', 'card', 'editable-card'],
    },
    tabPosition: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    size: {
      control: 'radio',
      options: ['small', 'middle', 'large'],
    },
    centered: {
      control: 'boolean',
    },
    // responsive: {
    //   control: 'boolean',
    // },
    draggable: {
      control: 'boolean',
    },
    tabBarGutter: {
      control: 'number',
    },
    destroyInactiveTabPane: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppTabs>;

/* -------------------------------------------------------------------------- */
/* Line Tabs (Default)                                                        */
/* -------------------------------------------------------------------------- */

export const LineTabs: Story = {
  render: () => (
    <div className="w-full">
      <Title level={3} className="mb-4">
        Line Tabs (Default)
      </Title>
      <Text type="secondary" className="block mb-4">
        Default style with underline indicator. Best for content sections.
      </Text>
      <AppTabs
        type="line"
        tabBarGutter={32}
        items={[
          {
            key: 'tab1',
            label: 'Tab 1',
            children: <div className="p-4">Content of Tab 1</div>,
          },
          {
            key: 'tab2',
            label: 'Tab 2',
            children: <div className="p-4">Content of Tab 2</div>,
          },
          {
            key: 'tab3',
            label: 'Tab 3',
            children: <div className="p-4">Content of Tab 3</div>,
          },
        ]}
      />
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/* Draggable Tabs                                                             */
/* -------------------------------------------------------------------------- */

export const DraggableTabs: Story = {
  render: () => <DraggableTabsDemo />,
};

function DraggableTabsDemo() {
  const [items, setItems] = useState<TabItem[]>([
    {
      key: 'tab1',
      label: 'Tab 1',
      icon: <HomeOutlined />,
      children: <div className="p-4">Content of Tab 1</div>,
    },
    {
      key: 'tab2',
      label: 'Tab 2',
      icon: <UserOutlined />,
      children: <div className="p-4">Content of Tab 2</div>,
    },
    {
      key: 'tab3',
      label: 'Tab 3',
      icon: <SettingOutlined />,
      children: <div className="p-4">Content of Tab 3</div>,
    },
  ]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setItems((prev) => {
        const activeIndex = prev.findIndex((i) => i.key === active.id);
        const overIndex = prev.findIndex((i) => i.key === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
    }
  };

  return (
    <div className="w-full">
      <Title level={3} className="mb-4">
        Draggable Tabs
      </Title>
      <Text type="secondary" className="block mb-4">
        Drag and drop tabs to reorder them.
      </Text>
      <AppTabs draggable onDragEnd={onDragEnd} items={items} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Responsive Tabs                                                            */
/* -------------------------------------------------------------------------- */

export const ResponsiveTabs: Story = {
  render: () => (
    <div className="w-full">
      <Title level={3} className="mb-4">
        Responsive Tabs
      </Title>
      <Text type="secondary" className="block mb-4">
        Switch to mobile view in Storybook to see the tabs convert to a Select
        dropdown.
      </Text>
      <AppTabs
        // responsive
        items={[
          {
            key: 'tab1',
            label: 'Overview',
            icon: <DashboardOutlined />,
            children: (
              <Card title="Overview Content" className="mt-4">
                Detailed metrics and graphs...
              </Card>
            ),
          },
          {
            key: 'tab2',
            label: 'Users',
            icon: <UserOutlined />,
            badge: 12,
            children: (
              <Card title="User Management" className="mt-4">
                List of active users...
              </Card>
            ),
          },
          {
            key: 'tab3',
            label: 'Settings',
            icon: <SettingOutlined />,
            children: (
              <Card title="Settings" className="mt-4">
                Configure your application...
              </Card>
            ),
          },
        ]}
      />
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/* Card Tabs                                                                   */
/* -------------------------------------------------------------------------- */

export const CardTabs: Story = {
  render: () => (
    <div className="w-full">
      <Title level={3} className="mb-4">
        Card Tabs
      </Title>
      <Text type="secondary" className="block mb-4">
        Card-style tabs with borders. Best for managing multiple views.
      </Text>
      <AppTabs
        type="card"
        items={[
          {
            key: 'tab1',
            label: 'Tab 1',
            children: <div className="p-4">Content of Tab 1</div>,
          },
          {
            key: 'tab2',
            label: 'Tab 2',
            children: <div className="p-4">Content of Tab 2</div>,
          },
          {
            key: 'tab3',
            label: 'Tab 3',
            children: <div className="p-4">Content of Tab 3</div>,
          },
        ]}
      />
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/* Editable Card Tabs (Add/Close)                                             */
/* -------------------------------------------------------------------------- */

export const EditableCardTabs: Story = {
  render: () => <EditableCardTabsDemo />,
};

function EditableCardTabsDemo() {
  const [activeKey, setActiveKey] = useState('tab1');
  const [items, setItems] = useState<TabItem[]>([
    {
      key: 'tab1',
      label: 'Tab 1',
      children: <div className="p-4">Content of Tab 1</div>,
    },
    {
      key: 'tab2',
      label: 'Tab 2',
      children: <div className="p-4">Content of Tab 2</div>,
    },
    {
      key: 'tab3',
      label: 'Tab 3',
      children: <div className="p-4">Content of Tab 3</div>,
      closable: false,
    },
  ]);

  const addTab = () => {
    const newKey = `tab${items.length + 1}`;
    setItems([
      ...items,
      {
        key: newKey,
        label: `Tab ${items.length + 1}`,
        children: <div className="p-4">New Content</div>,
      },
    ]);
    setActiveKey(newKey);
  };

  const removeTab = (targetKey: string) => {
    setItems(items.filter((item) => item.key !== targetKey));
    if (activeKey === targetKey) {
      const remainingKey = items.find((item) => item.key !== targetKey)?.key;
      setActiveKey(remainingKey || '');
    }
  };

  return (
    <div className="w-full">
      <Title level={3} className="mb-4">
        Editable Card Tabs
      </Title>
      <Text type="secondary" className="block mb-4">
        Tabs with add (+) and close (x) buttons. Use onEdit callback to handle
        add/remove.
      </Text>
      <AppTabs
        type="editable-card"
        activeKey={activeKey}
        onChange={setActiveKey}
        onEdit={(key, action) => {
          if (action === 'add') addTab();
          if (action === 'remove') removeTab(key as string);
        }}
        addIcon={<PlusOutlined />}
        items={items}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* With Icons & Badges                                                        */
/* -------------------------------------------------------------------------- */

export const WithIconsAndBadges: Story = {
  render: () => (
    <div className="w-full space-y-8">
      <div>
        <Title level={3} className="mb-4">
          Tabs with Icons & Badges
        </Title>
        <AppTabs
          type="line"
          tabBarGutter={24}
          items={[
            {
              key: 'inbox',
              label: 'Inbox',
              icon: <BellOutlined />,
              badge: 5,
              children: <div className="p-4">Inbox Messages</div>,
            },
            {
              key: 'tasks',
              label: 'Tasks',
              icon: <FileTextOutlined />,
              badge: 12,
              children: <div className="p-4">Task List</div>,
            },
            {
              key: 'settings',
              label: 'Settings',
              icon: <SettingOutlined />,
              children: <div className="p-4">Application Settings</div>,
            },
          ]}
        />
      </div>
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/* Positions & Sizes                                                          */
/* -------------------------------------------------------------------------- */

export const CustomLayout: Story = {
  render: () => (
    <div className="w-full space-y-8">
      <div>
        <Title level={3} className="mb-4">
          Left Position (Vertical)
        </Title>
        <AppTabs
          tabPlacement="start"
          style={{ height: 220 }}
          items={[
            {
              key: '1',
              label: 'Tab 1',
              children: <div className="p-4">Vertical Content 1</div>,
            },
            {
              key: '2',
              label: 'Tab 2',
              children: <div className="p-4">Vertical Content 2</div>,
            },
          ]}
        />
      </div>
      <div>
        <Title level={3} className="mb-4">
          Small Centered Tabs
        </Title>
        <AppTabs
          size="small"
          centered
          items={[
            {
              key: '1',
              label: 'Compact 1',
              children: <div className="p-4">Compact Content</div>,
            },
            {
              key: '2',
              label: 'Compact 2',
              children: <div className="p-4">Compact Content</div>,
            },
          ]}
        />
      </div>
    </div>
  ),
};

/* -------------------------------------------------------------------------- */
/* Dashboard Example                                                          */
/* -------------------------------------------------------------------------- */

export const DashboardExample: Story = {
  render: () => (
    <div className="w-full">
      <Title level={3} className="mb-4">
        Real-world Dashboard
      </Title>
      <AppTabs
        size="large"
        tabBarGutter={16}
        tabBarExtraContent={
          <Button type="primary" icon={<PlusOutlined />}>
            Action
          </Button>
        }
        items={[
          {
            key: 'home',
            label: 'Home',
            icon: <HomeOutlined />,
            children: (
              <div className="p-6 bg-gray-50 rounded-lg">
                <Title level={4}>Overview</Title>
                <Text>Welcome to your dashboard...</Text>
              </div>
            ),
          },
          {
            key: 'team',
            label: 'Team',
            icon: <TeamOutlined />,
            badge: 'New',
            children: (
              <div className="p-6 bg-gray-50 rounded-lg">
                <Title level={4}>Team Members</Title>
                <Text>Manage your colleagues here.</Text>
              </div>
            ),
          },
        ]}
      />
    </div>
  ),
};
