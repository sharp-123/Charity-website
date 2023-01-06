<header style="top:0;">
    <div class="my-nav">
      <div class="container">
        <div class="row">
          <div class="nav-items">
            <div class="menu-toggle"></div>
            <div class="logo">
              <a href="{{route('aspect.home')}}"><img src="{{asset('/')}}assets/images/logo.png"></a>
            </div>
            <div class="menu-items">
              <div class="menu">
                <ul>
                  <li><a href="{{route('aspect.foundation')}}">Our Foundation</a></li>
                  <li><a href="{{route('aspect.aboutus')}}">Our Strategy</a></li>
                  <li><a href="{{route('aspect.services')}}">Our Work</a></li>
                  <li><a href="{{route('aspect.blog')}}">News and Events</a></li>
                  <!-- <li><a href="{{route('aspect.contactus')}}">Contact Us</a></li> -->
                  @if(Auth::check() == false)
                    <li><a href="{{url('login')}}">{{ __('Login') }}</a></li>
                    <li><a href="{{url('register')}}">{{ __('Register') }}</a></li>
                  @else
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle active" href="#" data-toggle="dropdown">
                            <!-- <span class="image-circle"><img src="{{Auth::user()->image? Auth::user()->image_url:Auth::user()->default_img}}" width="30" alt=""></span> -->
                            {{Auth::user()->name}}
                        </a>
                        <div class="dropdown-menu">
                            @if(Auth::user()->role->name == "Admin")
                                <a class="dropdown-item" href="{{route('admin.home')}}" style="color:black;">
                                    <i class="fas fa-user fa-sm fa-fw mr-2 text-muted"></i>
                                    {{ __('Profile') }}
                                </a>
                            @elseif(Auth::user()->role->name == "User")
                                <a class="dropdown-item" href="{{route('user.home')}}" style="color:black;">
                                    <i class="fas fa-user fa-sm fa-fw mr-2 text-muted"></i>
                                    {{ __('Profile') }}
                                </a>
                            @else
                                <a class="dropdown-item" href="#" style="color:black;">
                                    <i class="fas fa-user fa-sm fa-fw mr-2 text-muted"></i>
                                    {{ __('Profile') }}
                                </a>
                            @endif
                            <a class="dropdown-item" href="{{url('logout')}}" style="color:black;">
                                <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-muted"></i>
                                {{ __('Logout') }}
                            </a>
                        </div>
                    </li>
                  @endif
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
